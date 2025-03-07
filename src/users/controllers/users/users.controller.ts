import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from 'src/auth/dtos/auth/login.dto';
import { LoginResponse } from 'src/auth/types/response.type';
import { ContactUsDto } from 'src/users/dtos/contact-us.dto';
import { SignupDto } from 'src/users/dtos/signup.dto';
import { UsersService } from 'src/users/services/users/users.service';

import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) { }

  //  trainer/Coach signup
  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    description: 'User has been created.',
  })
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiOperation({ summary: 'Create a new User' })
  @ApiBody({
    description: 'User Signup',
    type: SignupDto,
  })
  @ApiConsumes('multipart/form-data')
  async signupClient(
    @Body() userBody: SignupDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    return await this.userService.userSignup({ ...userBody, profileImage });
  }

  @Post('/deleteUser')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    description: 'User has been deleted.',
  })
  @ApiOperation({ summary: 'Delete user' })
  async deleteUserByConfirmingPassword(@Req() req: Request, @Body() body: any) {
    return await this.userService.deleteUserByConfirmingPassword(
      req.user['sub'],
      body.password,
    );
  }

  @Post('/sendAccountDeletionEmail')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    description: 'User has been deleted.',
  })
  @ApiOperation({ summary: 'Delete user' })
  async sendAccountDeletionEmail(@Body('email') email: string) {
    return await this.userService.sendAccountDeletionEmail(email);
  }

  @Post('/deleteUserUsingOtp')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    description: 'User has been deleted.',
  })
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Body('otp') otp: string) {
    return await this.userService.deleteUserUsingOtp(otp);
  }


  @Get('/sendTestEmails')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'send test emails',
  })
  @ApiOperation({ summary: 'Create a new client' })
  async sendTestEmails() {
    return await this.userService.sendTestEmailToAllUsers();
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'user details',
    type: LoginResponse,
  })
  @ApiOperation({ summary: 'login ' })
  async clientLogin(@Body() userBody: LoginDto) {
    return await this.userService.clientLogin(userBody);
  }

  @Post('/contactUs')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'Contact Us',
    type: ContactUsDto,
  })
  @ApiOperation({ summary: 'Contact Us' })
  @ApiOkResponse({
    description: 'Contact Us',
  })
  async contactUs(@Body() userBody: ContactUsDto, @Req() req: Request) {
    await this.userService.contactUs(userBody, req.user['sub']);
    return {
      status: 'Success',
      message: 'Your message has been sent !',
    };
  }


}
