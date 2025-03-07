import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from 'src/auth/dtos/auth/changePassword.dto';
import { ForgotPasswordDto } from 'src/auth/dtos/auth/forgotPassword.dto';
import { LoginDto } from 'src/auth/dtos/auth/login.dto';
import { ResetPasswordDto } from 'src/auth/dtos/auth/resetPassword.dto';
import { LoginResponse } from 'src/auth/types/response.type';
import { MailService } from 'src/mails/services/mail.services';
import { UsersService } from 'src/users/services/users/users.service';

import { LogoutDto } from 'src/auth/dtos/auth/logout.dto';
import { NotificationsService } from 'src/notifications/services/notifications/notifications.service';
import { ProfilesServices } from 'src/profile/services/profile.services';
import { SignupDto } from 'src/users/dtos/signup.dto';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/roles/roles.enum';
import { validateUserRoleForRegistration } from 'src/utils/roleValidator';
import { In } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private configService: ConfigService,
    private profilesService: ProfilesServices,
    private notificationService: NotificationsService,
  ) { }

  async getTokens(userId: string, email: string, role: Role) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role: role,
        },
        {
          secret: this.configService.get('auth.atSecret'), //make this a random set of characters later
          expiresIn: this.configService.get('auth.atExpiry'),
          //15 minutes
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('auth.rtSecret'), //make this a random set of characters later
          expiresIn: this.configService.get('auth.rtExpiry'), //7 days
        },
      ),
    ]);
    // generated rt and at tokens.
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async UpdateRtHash(userId: string, rt: string | null) {
    // update the user's rt in database
    //  TODO: Incorporate hashing for RT tokens with argon or similar package
    const hash = rt;
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('NO user found !');
    }

    await this.usersService.updateUser(user, { hashedRt: hash });
  }

  async refreshToken(userId: string, _refresh_token: string) {
    // if (!user || !user.hashedRt) {
    //   throw new ForbiddenException('Access Denied !');
    // }

    // compare refresh token in db with provided token
    // TODO: Incorporate encryption for refresh tokens later

    // if (refresh_token !== user.hashedRt) {
    //   throw new ForbiddenException('Access Denied !');
    // }

    // todo incorporate multiple refresh tokens and check in DB if the refresh token
    // find user and get their stored refresh token.
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('Cant find user');
    }
    const tokens = await this.getTokens(user.userId, user.email, user.role);
    const userProfile = await this.profilesService.fetchProfile(user.userId);

    // await this.UpdateRtHash(user.userId, tokens.refresh_token);
    return { tokens, user: userProfile };
  }

  async sendVerificationEmail(user: User) {
    // Generate an email confirmation token
    const token = this.jwtService.sign(
      {
        sub: user.userId,
        email: user.email,
      },
      {
        secret: this.configService.get('auth.verificationSecret'),
        expiresIn: this.configService.get('auth.verificationExpiry'),
      },
    );

    const url = `${this.configService.get(
      'app.verifyUserPageUrl',
    )}?token=${token}`;

    // Send an email confirmation link to the user
    await this.mailService.sendEmailWithSES(
      'account-confirmation',
      {
        email: user?.email,
        displayName: user?.displayName,
        url: url,
      },
      user?.email,
      ' Account Creation',
    );
  }

  async signupLocal(userBody: SignupDto, userRole: Role) {
    const usersWithThisEmail = await this.usersService.getUsersByCriteria({
      email: userBody.email,
    });

    // Extract roles of existing users with the same email
    const existingUserRoles = usersWithThisEmail.map((user) => user.role);

    // validate if user can register with input role. if not valid, throw appropriate exception
    await validateUserRoleForRegistration(existingUserRoles, userRole);
    // Create a new user
    const newUser = await this.usersService.createUser(
      { ...userBody },
      userRole,
    );

    // Send an email confirmation link to the new user if they are a Client
    if (newUser.role === Role.Client) {
      const token = this.jwtService.sign(
        {
          sub: newUser.userId,
          email: newUser.email,
        },
        {
          secret: this.configService.get('auth.verificationSecret'),
          expiresIn: this.configService.get('auth.verificationExpiry'),
        },
      );

      const url = `${this.configService.get(
        'app.verifyUserPageUrl',
      )}?token=${token}`;

      // await this.sendVerificationEmail(newUser);

      await this.mailService.sendEmailWithSES(
        'account-confirmation',
        {
          displayName: newUser?.displayName,
          url: url,
          email: newUser.email,
        },
        newUser?.email,
        'Welcome to Server! Please confirm your account.',
      );
    }

    return {
      status: 'Success',
      message: 'User has been created!',
    };
  }

  async resendVerificationEmail(email: string) {
    // const user = await this.usersService.getUserByEmail(userBody.email);
    const users = await this.usersService.getUsersByEmail(email);
    const user = users.find((user) => user.role === 'client');

    if (user) {
      //
      const token = this.jwtService.sign(
        {
          sub: user.userId,
          email: user.email,
        },
        {
          secret: this.configService.get('auth.verificationSecret'),
          expiresIn: this.configService.get('auth.verificationExpiry'),
        },
      );
      const url = `${this.configService.get(
        'app.verifyUserPageUrl',
      )}?token=${token}`;

      await this.mailService.sendEmailWithSES(
        'resend-confirmation',
        {
          email: user?.email,
          displayName: user?.displayName,
          url: url,
        },
        user?.email,
        'Welcome to Server! Please confirm your account.',
      );
      return {
        status: 'Success',
        message: 'Email has been sent successfully!',
      };
    } else {
      throw new NotFoundException('user does not exist');
    }
  }

  async signinLocal(
    userBody: LoginDto,
    allowedRoles?: Array<string>,
  ): Promise<LoginResponse> {
    // find user by email. if he doesnt exist, deny access.
    const usersWithMatchingEmail = await this.usersService.getUsersByCriteria(
      {
        email: userBody.email,
      },
      true,
    );
    if (usersWithMatchingEmail.length === 0) {
      throw new NotFoundException('No such user found');
    }
    const rolesForMatchingUsers = new Map<string, User>();
    usersWithMatchingEmail.forEach((user) =>
      rolesForMatchingUsers.set(user.role, user),
    );
    const user = usersWithMatchingEmail.find((user) =>
      allowedRoles.includes(user.role),
    );
    if (!user) {
      throw new ForbiddenException(`You are not registered`);
    }
    if (user.role === Role.Trainer || user.role === Role.Coach) {
      if (!user.isVerified) {
        throw new ForbiddenException(
          'Account not verified! Our admin team will contact you soon.',
        );
      }
    } else {
      if (!user.isVerified) {
        throw new ForbiddenException(
          'Account not verified! Please verify your account via your email.',
        );
      }
    }

    // else match password
    const matchPassword = await bcrypt.compare(
      userBody.password,
      user.password,
    );
    if (!matchPassword) {
      throw new ForbiddenException('Access Denied. Incorrect Password');
    }

    // create new tokens for login
    //TODO:Refactor in the form of a function later
    const tokens = await this.getTokens(user.userId, user.email, user.role);
    await this.UpdateRtHash(user.userId, tokens.refresh_token);
    const userProfile = await this.profilesService.fetchProfile(user.userId);
    if (userProfile.role === Role.GhostCoach) {
      userProfile.profilePicDetails.url = 'https://i.stack.imgur.com/IHLNO.jpg';
      userProfile.profilePic = 'https://i.stack.imgur.com/IHLNO.jpg';
    }

    return { tokens, user: userProfile };
  }

  async logout(userId: string, logoutDto: LogoutDto) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('cant find user');
    }
    if (user.hashedRt !== null) {
      await this.UpdateRtHash(user.userId, null);
    }
    if (logoutDto.token) {
      await this.notificationService.removeNotificationToken(
        userId,
        logoutDto.token,
      );
    }
  }

  async forgotPasswordClient(userBody: ForgotPasswordDto) {
    const usersWithMatchingEmail = await this.usersService.getUsersByCriteria(
      {
        email: userBody.email,
        role: Role?.Client,
      },
      true,
    );

    if (usersWithMatchingEmail?.length === 0) {
      throw new NotFoundException('No user found with this email address');
    }

    // since only one user can have a unique email and role client. we will get user from [0]
    const clientUser = usersWithMatchingEmail[0];

    const token = this.jwtService.sign(
      {
        sub: clientUser.userId,
        email: clientUser.email,
      },
      {
        secret: this.configService.get('auth.forgotPasswordSecret'),
        expiresIn: this.configService.get('auth.forgotExpiry'),
      },
    );

    // Store the token in the DB for comparison later
    await this.usersService.updateUser(clientUser, { ResetToken: token });

    // Generate the reset password link (Note: replace with actual page link later)
    const url = `${this.configService.get(
      'app.resetPasswordPageUrl',
    )}?token=${token}`;

    await this.mailService.sendEmailWithSES(
      'forgot-password',
      {
        displayName: clientUser?.displayName,
        email: clientUser?.email,
        url: url,
      },
      clientUser?.email,
      'Forgot Password! Lets get you back on track',
    );
  }

  async forgotPasswordInstructor(userBody: ForgotPasswordDto) {
    const usersWithMatchingEmail = await this.usersService.getUsersByCriteria(
      {
        email: userBody.email,
        role: In([Role.Trainer, Role.Coach]),
      },
      true,
    );

    // Check if there's a user with the instructor role
    if (usersWithMatchingEmail?.length === 0) {
      throw new NotFoundException('No user found with this email address');
    }

    const instructorUser = usersWithMatchingEmail[0];

    const token = this.jwtService.sign(
      {
        sub: instructorUser.userId,
        email: instructorUser.email,
      },
      {
        secret: this.configService.get('auth.forgotPasswordSecret'),
        expiresIn: this.configService.get('auth.forgotExpiry'),
      },
    );

    // Store the token in the DB for comparison later
    await this.usersService.updateUser(instructorUser, { ResetToken: token });

    // Generate the reset password link (Note: replace with actual page link later)
    const url = `${this.configService.get(
      'app.resetPasswordPageUrl',
    )}?token=${token}`;

    await this.mailService.sendEmailWithSES(
      'forgot-password',
      {
        displayName: instructorUser?.displayName,
        email: instructorUser?.email,

        url: url,
      },
      instructorUser?.email,
      'Forgot Password! Lets get you back on track',
    );
  }

  async resetPassword(userBody: ResetPasswordDto) {
    // find user by the previously generated token
    const result = this.jwtService.verify(userBody.token, {
      secret: this.configService.get('auth.forgotPasswordSecret'),
    });
    if (!result) {
      throw new ForbiddenException('Token Expired');
    }
    const userId = result.sub;
    const user = await this.usersService.getUserById(userId, [], true);
    if (!user) {
      throw new ForbiddenException('Access Denied. No such user exists');
    }
    const matchPassword = await bcrypt.compare(
      userBody.password,
      user.password,
    );
    if (matchPassword) {
      throw new ForbiddenException(
        'Your new password cannot be the same as your current password',
      );
    }
    if (user.ResetToken === null) {
      throw new ForbiddenException(
        'Password has already been reset. This link is no longer valid',
      );
    }
    if (user.ResetToken !== userBody.token) {
      throw new ForbiddenException(
        'This link is no longer valid. Please check your mail for another link to reset password',
      );
    }
    // update the password with hashed password in DB
    // make the paswordResetToken null.
    await this.usersService.updateUser(user, {
      ResetToken: null,
      password: userBody.password,
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // fetch user from db,
    const user = await this.usersService.getUserById(userId, [], true);
    // if user doesnt exist, throw exception
    if (!user) {
      throw new ForbiddenException('Access Denied');
    }
    // check old password matches or not
    const matchPassword = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!matchPassword) {
      throw new ForbiddenException('Your old password is not correct');
    }
    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new ForbiddenException(
        'Your new password cannot be the same as your current password',
      );
    }
    await this.usersService.updateUser(user, {
      password: changePasswordDto.newPassword,
    });
  }

  async verifyNewCreatedUser(token: string) {
    const result = this.jwtService.verify(token, {
      secret: this.configService.get('auth.verificationSecret'),
    });

    if (!result) {
      throw new ForbiddenException('Token Expired');
    }
    const userId = result.sub;
    const user = await this.usersService.getUserById(userId, [], true);
    if (!user) {
      throw new ForbiddenException('Access Denied !');
    }
    await this.usersService.updateUser(user, {
      isVerified: true,
    });
  }
}
