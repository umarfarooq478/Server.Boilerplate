import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/users/roles/roles.decorator';
import { Role } from 'src/users/roles/roles.enum';
import { RolesGuard } from 'src/users/roles/roles.guard';
import { EditProfileDto } from '../dto/profiles/editProfile.dto';
import { ProfilesServices } from '../services/profile.services';
@ApiTags('profile')
@Controller('profile')
export class ProfilesController {
  constructor(private profileServices: ProfilesServices) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get details of ones own profile' })
  async getOwnProfileDetails(@Req() req: Request) {
    return await this.profileServices.fetchProfile(req.user['sub']);
  }

  //only admin will be able to access user's details
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Coach, Role.Trainer)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/fetchProfileDetails/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get details of a particular user' })
  async getUserProfileDetails(@Param('userId') userId: string) {
    return await this.profileServices.fetchProfile(userId);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('/editProfile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit basic profile details of a user' })
  async editProfile(@Body() userBody: EditProfileDto, @Req() req: Request) {
    return await this.profileServices.editProfile(userBody, req.user['sub']);
  }
}
