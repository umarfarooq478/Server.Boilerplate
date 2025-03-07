import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthPasswordlessController } from './controllers/auth/auth-passwordless.controller';
import { AuthPaswordlessService } from './services/auth/auth-passwordless.services';
import { Code } from 'src/users/entities/code.entity';
import { UsersModule } from 'src/users/users.module';
import { MailService } from 'src/mails/services/mail.services';
import { HttpModule } from '@nestjs/axios';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './services/auth/auth.services';
import { ProfilesServices } from 'src/profile/services/profile.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Code]),
    HttpModule,
    forwardRef(() => UsersModule),
    NotificationsModule,
  ],
  controllers: [AuthPasswordlessController],
  providers: [
    AuthPaswordlessService,
    ConfigService,
    MailService,
    JwtService,
    AuthService,
    ProfilesServices,
  ],
})
export class AuthPasswordlessModule {}
