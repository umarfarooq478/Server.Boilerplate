import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/services/auth/auth.services';
import { MailService } from 'src/mails/services/mail.services';
import { ProfilesModule } from 'src/profile/profile.module';
import { AtStrategy, RtStrategy } from './../auth/strategies';
import { UsersController } from './controllers/users/users.controller';
import { User } from './entities/user.entity';
import { UsersService } from './services/users/users.service';

import { SettingsModule } from 'src/settings/settings.module';
import { DeletionOtp } from './entities/deletionOtp';
import { FileUploadService } from 'src/utils/S3/fileUpload';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, DeletionOtp]),
    HttpModule,
    forwardRef(() => AuthModule),
    ProfilesModule,
    SettingsModule,
    JwtModule.register({}),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AtStrategy,
    RtStrategy,
    AuthService,
    MailService,
    FileUploadService,
  ],
  exports: [UsersService],
})
export class UsersModule { }
