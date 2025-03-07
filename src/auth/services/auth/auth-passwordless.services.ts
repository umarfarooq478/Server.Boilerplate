import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mails/services/mail.services';
import { UserToAuthenticateDTO } from 'src/users/dtos/userToAuth.dto';
import { Code } from 'src/users/entities/code.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { Repository } from 'typeorm';
import { AuthService } from './auth.services';

@Injectable()
export class AuthPaswordlessService {
  constructor(
    @InjectRepository(Code) public codeRepository: Repository<Code>,
    private mailService: MailService,
    private userService: UsersService,
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  //method to generate keyword
  async generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6);
  }

  async sendCodeViaEmail(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('No such user exists');
    }
    const code = await this.generateCode();

    const url = `${this.configService.get('app.otpLoginPageUrl') || ''
      }?otp=${code}`;

    await this.mailService.sendEmailWithSES(
      'otp',
      {
        email: user?.email,
        displayName: user?.displayName,
        url: url,
      },
      user?.email,
      ' Login on other device',
    );

    const codeEntity = new Code();
    codeEntity.userId = user.userId;
    codeEntity.code = code;
    codeEntity.createdAt = new Date().getTime().toString();

    await this.codeRepository.save(codeEntity);

    return {
      status: 'success',
      data: {
        code,
      },
    };
  }



  async AuthenticateViaCode(userDto: UserToAuthenticateDTO) {
    const codeIssuedToUser = await this.codeRepository.findOne({
      where: {
        code: userDto.code,
      },
    });

    if (!codeIssuedToUser) {
      throw new NotFoundException(' Oops! You have entered an invalid code.');
    }

    const user = await this.userService.getUserById(codeIssuedToUser.userId);

    const creationDateTime = new Date(Number(codeIssuedToUser.createdAt));
    const validDateTime = new Date(creationDateTime.getTime() + 1800 * 1000);

    const currentTime = new Date();

    if (codeIssuedToUser.code !== userDto.code) {
      throw new ForbiddenException('Access Denied ! Invalid Code');
    }

    if (currentTime.getTime() > validDateTime.getTime()) {
      throw new ForbiddenException('Access Denied ! Code Expired');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('You must have a verified account to login');
    }
    await this.codeRepository.delete({
      code: userDto.code,
    });
    // will return both a refresh and access token
    const tokens = await this.authService.getTokens(
      user.userId,
      user.email,
      user.role,
    );

    const parsedUser = await this.userService.parseUserInfoToSendToClient(user);

    return {
      status: 'success',
      message: 'User successfully authenticated via code',
      tokens,
      user: parsedUser,
    };
  }


  /**
   * Check if the code belongs to the authenticated user
   * @Param userId: The user ID of the authenticated user
   * @Param code: The code to check
   */
  async isMyOTP(userId: string, code: string): Promise<boolean> {
    const codeIssuedToUser = await this.codeRepository.findOne({
      where: {
        code,
      },
    });

    if (codeIssuedToUser) {
      if (codeIssuedToUser.userId === userId) {
        return true;
      }
      return false;
    }
    throw new NotFoundException('OOps! You have entered an invalid code.');
  }


}
