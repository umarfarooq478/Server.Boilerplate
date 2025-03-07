import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPaswordlessService } from 'src/auth/services/auth/auth-passwordless.services';

import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserToAuthenticateDTO } from 'src/users/dtos/userToAuth.dto';
import { Roles } from 'src/users/roles/roles.decorator';
import { Role } from 'src/users/roles/roles.enum';

@ApiTags('auth-passwordless')
@Controller('auth-passwordless')
export class AuthPasswordlessController {
  constructor(private authPasswordLess: AuthPaswordlessService) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/dispatchCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'user recives a 6-digit code on his email.',
  })
  @ApiOperation({
    summary: 'A code is generated and sent to user email.',
  })
  async dispatchCode(@Req() req: Request) {
    return await this.authPasswordLess.sendCodeViaEmail(req.user['sub']);
  }



  @Post('/authenticateViaCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'generated access token & refresh token + fetch user details',
  })
  @ApiOperation({
    summary: 'validate user otp/code and grant access by generated tokens',
  })
  async authenticateUserViaCode(@Body() userDto: UserToAuthenticateDTO) {
    return await this.authPasswordLess.AuthenticateViaCode(userDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Client)
  @Get('/isMyOTP/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Checks if the OTP belongs to the same (authenticated) user.',
  })
  @ApiOperation({
    summary: 'Checks if the OTP belongs to the same (authenticated) user',
  })
  async isMyOTP(@Req() req: Request, @Param('code') code: string) {
    const userId = req.user['sub'];
    return await this.authPasswordLess.isMyOTP(userId, code);
  }


}
