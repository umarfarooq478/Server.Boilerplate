import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { merge } from 'lodash';
import { LoginDto } from 'src/auth/dtos/auth/login.dto';
import { AuthService } from 'src/auth/services/auth/auth.services';
import { CustomLogger } from 'src/logger/services/logger.service';
import { MailService } from 'src/mails/services/mail.services';

import { ContactUsDto } from 'src/users/dtos/contact-us.dto';
import { SignupDto } from 'src/users/dtos/signup.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/roles/roles.enum';
import { UserDetails } from 'src/users/types';
import { validateUserRoleForRegistration } from 'src/utils/roleValidator';
import { generateNewRandomId, hashData } from 'src/utils/token';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Repository
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ProfilePicService } from '../../../profile/services/profile-pic/profile-pic.service';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';


import { SettingsService } from 'src/settings/services/settings.service';
import { DeletionOtp } from 'src/users/entities/deletionOtp';

import axios from 'axios';
import { FileUploadService } from 'src/utils/S3/fileUpload';

@Injectable()
export class UsersService {
  find() {
    throw new Error('Method not implemented.');
  }
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) public userRepository: Repository<User>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private profilePicService: ProfilePicService,
    private mailService: MailService,
    private configService: ConfigService,
    private readonly logger: CustomLogger,

    @Inject(forwardRef(() => SettingsService))
    private settingService: SettingsService,
    @InjectRepository(DeletionOtp)
    public otpRepository: Repository<DeletionOtp>,
    private fileUploadService: FileUploadService,
  ) { }

  async seedDatabase() {
    try {


    } catch (error) {
      // use logger to log error
      this.logger.error({
        message: `Error while seeding users database:  ${error}`,
        stack: error.stack,
        topicName: 'Database Seeding Error',
      });
      throw new Error(error);
    }
  }
  async parseUserInfoToSendToClient(user: User): Promise<UserDetails> {
    // Parses the user object and removes sensistive information such as password and tokens
    const parsedUser: any = { ...user };
    parsedUser.profilePic = user?.profilePicDetails?.url || '';
    delete parsedUser._id;
    delete parsedUser.password;
    delete parsedUser.hashedRt;
    delete parsedUser.isVerified;
    delete parsedUser.ResetToken;
    parsedUser.role = user.role ?? Role.Client;
    return parsedUser as UserDetails;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // get a User by email. Returns null if no matching user is found
    const user = await this.userRepository.findOneBy({
      email: email,
    });
    return user ?? null;
  }

  async getUsersByEmail(email: string): Promise<User[] | null> {
    // get all User by email. Returns null if no matching user is found
    const users = await this.userRepository.find({
      where: {
        email: email,
      },
    });
    return users ?? null;
  }

  // a helper method to save an object to DB.
  async saveToRepo(obj: object) {
    return await this.userRepository.save(obj);
  }
  // a helper method to delete user from DB
  async deleteUser(criteria: FindOptionsWhere<User>) {
    return await this.userRepository.delete(criteria);
  }

  async deleteUserUsingOtp(otp: string) {
    const otpRecord = await this.otpRepository.findOne({ where: { otp: otp } });

    if (!otpRecord) {
      return { message: 'Invalid otp', flag: false };
    }
    if (otpRecord.expiryDate < new Date()) {
      return { message: 'OTP has expired', flag: false };
    }
    const user = await this.getUserById(otpRecord.userId);
    await this.deleteUser({ userId: user.userId });
    await this.otpRepository.delete({ id: otpRecord.id });
    return { flag: true, message: 'User deleted ' };
  }

  async sendAccountDeletionEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
      });
      if (!user) {
        return { message: "User with this email doesn't exist", flag: false };
      }

      const otp = await generateNewRandomId();

      const url = `${this.configService.get(
        'app.deleteUserPageUrl',
      )}?otp=${otp}`;
      const deleteUserOtpExpiry = this.configService.get(
        'app.deleteUserOtpExpiry',
      );
      const expiryDate = new Date();
      // todo: get expiry from a config variable
      expiryDate.setMinutes(expiryDate.getMinutes() + deleteUserOtpExpiry);

      const otpEntity = new DeletionOtp();
      otpEntity.userId = user.userId; // Assuming user ID is stored in 'id' field
      otpEntity.otp = otp;
      otpEntity.expiryDate = expiryDate;
      // delete previous otp of same user if any
      const otpExists = await this.otpRepository.findOne({
        where: { userId: user.userId },
      });
      if (otpExists) {
        await this.otpRepository.delete({ id: otpExists?.id });
      }

      await this.otpRepository.save(otpEntity);
      await this.mailService.sendEmailWithSES(
        'account-deletion',
        {
          displayName: user?.displayName,
          url: url,
          email: user.email,
        },
        user?.email,
        'We are sorry to see you go! Please confirm to delete your account.',
      );

      return {
        message: 'Email has been sent to this account',
        flag: true,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
  // This function is created when user is asked to enter password for confirmation for deleting his account
  async deleteUserByConfirmingPassword(userId: string, password: string) {
    try {
      const user = await this.getUserById(userId, [], true);
      const matchPassword = await bcrypt.compare(password, user.password);
      if (!matchPassword) {
        return { message: 'Passwords doesnot match', flag: false };
      }
      await this.userRepository.delete({
        userId: userId,
      });
      return {
        message: 'Your account has been deleted successfully',
        flag: true,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      this.logger.error({
        message: `error deleting user${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
      throw new Error('Error while deleting user' + error);
    }
  }




  // a helper method to retrieve results from DB
  async getUsersByCriteria(
    criteria: FindOptionsWhere<User>,
    includePassword = false,
  ) {
    if (includePassword) {
      const matchingUsers = await this.userRepository
        .createQueryBuilder('user')
        .addSelect(['user.*', 'user.password'])
        .where(criteria)
        .getMany();
      return matchingUsers;
    } else {
      const matchingUsers = await this.userRepository.find({
        where: criteria,
      });
      return matchingUsers;
    }
  }

  async getUserById(
    userId: string,
    relations: string[] | FindOptionsRelations<User> = [],
    includePassword = false,
  ): Promise<User | null> {
    if (includePassword) {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect(['user.*', 'user.password'])
        .where({ userId: userId })
        .getOne();
      if (!user) return null;
      return user;
    } else {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations,
      });
      if (!user) return null;
      return user;
    }
  }


  // test method to send emails to all users.

  async sendTestEmailToAllUsers() {
    // const users = await this.getUsersByCriteria({});

    try {
      await this.mailService.sendEmailWithSES(
        'instructor-account-confirmation',
        {
          email: 'nabeel.malik@code-huddle.com',
          displayName: 'mnmalikdev',
        },
        'nabeel.malik@code-huddle.com',
        'Confirmation Email For Signup',
      );
    } catch (e) {
      this.logger.error({
        message: `${e}`,
        stack: e.stack,
        topicName: 'Exception Logs',
      });
      throw new InternalServerErrorException(`${e}`);
    }
  }



  //method to update an existing user
  async updateUser(
    user: User,
    updatedUserProps: Partial<User>,
  ): Promise<User | null> {
    // Updates the properties in a user
    if (updatedUserProps.password !== undefined) {
      // if the password is to be updated encrypt it before saving
      const hash = await hashData(updatedUserProps.password);
      updatedUserProps.password = hash;
    }
    // if the user changes their instagram ID

    updatedUserProps.profilePicDetails = {
      url: await this.profilePicService.getRandomPic(),
      generatedAt: new Date().toString(),
    };

    const updatedUser: User = merge({ ...user }, updatedUserProps);
    await this.userRepository.update({ userId: user.userId }, updatedUser);
    return updatedUser;
  }

  /**
   * The function `getProfilePicDetails` retrieves profile picture details based on user input,
   * including handling Instagram usernames, uploaded images, and generating avatar images.
   * @param {SignupDto} userBody
   * @param {string} userId
   * @param {string} displayName
   * @param {Role} role
   * @returns The `getProfilePicDetails` method returns an object with a `url` property pointing to the
   * profile picture URL and a `generatedAt` property indicating the timestamp when the profile picture
   * was generated.
   */
  private async getProfilePicDetails(
    userBody: SignupDto,
    userId: string,
    displayName: string,
    role: Role,
  ) {
    if (userBody.profileImage) {
      const fileId = uuidv4();
      const filePath = `${this.configService.get(
        'S3.profilePicPrefix',
      )}/${fileId}_${userBody.profileImage.originalName}`;
      await this.fileUploadService.uploadFile(
        userBody.profileImage.buffer,
        filePath,
      );
      const uploadedFileUrl =
        await this.fileUploadService.getPublicUrlForObject(filePath);
      return {
        profilePicDetails: {
          url: uploadedFileUrl,
          generatedAt: new Date().toString(),
        },
        instagramUser: null,
      };
    } else {
      const avatarUrl = this.configService.get('app.randomAvatarApiUrl');
      const response = await axios.get(avatarUrl, {
        responseType: 'arraybuffer',
      });
      const fileId = uuidv4();
      const filePath = `${this.configService.get(
        'S3.profilePicPrefix',
      )}/${fileId}_avatar.png`;
      await this.fileUploadService.uploadFile(response.data, filePath);
      const uploadedFileUrl =
        await this.fileUploadService.getPublicUrlForObject(filePath);
      return {
        profilePicDetails: {
          url: uploadedFileUrl,
          generatedAt: new Date().toString(),
        },
      };
    }
  }



  //method to create a new user in DB
  async createUser(userBody: SignupDto, userRole: Role) {
    // Check if a user with the given email and specific roles already exists
    const users = await this.getUsersByCriteria({
      email: userBody.email,
    });

    // Extract roles of existing users with the same email
    const existingUserRoles = users.map((user) => user.role);

    // validate if user can register with input role. if not valid, throw appropriate exception
    await validateUserRoleForRegistration(existingUserRoles, userRole);

    const hash = await hashData(userBody.password);

    const newUser = new User();
    newUser.userId = generateNewRandomId();
    newUser.displayName = userBody.displayName;
    newUser.password = hash;
    newUser.email = userBody.email;
    newUser.birthday = userBody.birthday;

    const data = await this.getProfilePicDetails(
      userBody,
      newUser.userId,
      userBody.displayName,
      userRole,
    );
    newUser.profilePicDetails = data.profilePicDetails;

    newUser.phone = userBody.phone;
    newUser.country = userBody.country;
    newUser.role = userRole;



    await this.userRepository.save(newUser);
    return newUser;
  }

  //client signup endpoint
  async userSignup(userBody: SignupDto) {
    await this.authService.signupLocal(userBody, Role.Client);
    return {
      status: 'Success',
      message: 'User has been created !',
    };
  }
  //client login endpoint
  async clientLogin(userBody: LoginDto) {
    return await this.authService.signinLocal(userBody, [Role.Client]);
  }

  async contactUs(contactUsDto: ContactUsDto, userId: string) {
    // fetch user to have his sender email using his id
    const user = await this.getUserById(userId);
    const message = contactUsDto.message;
    const adminEmailAddress = this.configService.get('mail.adminEmail');
    // send email to admin containing the message of user

    // using brevo to send above

    // send the message of user to admin

    await this.mailService.sendEmailWithSES(
      'contact-us',
      {
        email: user?.email,
        displayName: user?.displayName,
        message: message,
      },
      adminEmailAddress,
      'Assistance requested from user',
    );

    // send user a confirmation email that his message has been sent
    await this.sendConfirmationEmailToUser(user?.email, user?.displayName);
  }

  async sendConfirmationEmailToUser(email: string, name: string) {
    await this.mailService.sendEmailWithSES(
      'contact-us-confirmation',
      {
        displayName: name,
        email: email,
      },
      email,
      'You have reached our inbox !',
    );
  }



}
