import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mails/mail.module';
import { MailService } from 'src/mails/services/mail.services';
import { ProfilesModule } from 'src/profile/profile.module';
import { ProfilesServices } from 'src/profile/services/profile.services';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.services';
import { AtStrategy, RtStrategy } from './strategies';
@Module({
  imports: [
    JwtModule.register({}),
    MailModule,
    forwardRef(() => UsersModule),
    ProfilesModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    MailService,
    ProfilesServices,
  ],
})
export class AuthModule {}
