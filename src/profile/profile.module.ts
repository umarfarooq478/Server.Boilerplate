import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { FileUploadService } from 'src/utils/S3/fileUpload';
import { ProfilesController } from './controller/profile.controller';
import { InjuryNoteEntity } from './entities/injuryNotes.entity';
import { ProfilePicService } from './services/profile-pic/profile-pic.service';
import { ProfilesServices } from './services/profile.services';
import { SettingsModule } from 'src/settings/settings.module';
import { MailModule } from 'src/mails/mail.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, InjuryNoteEntity]),
    HttpModule,
    forwardRef(() => UsersModule),
    NotificationsModule,
    SettingsModule,
    MailModule,
  ],
  controllers: [ProfilesController],
  providers: [
    ProfilesServices,
    ProfilePicService,
    FileUploadService,

  ],
  exports: [ProfilesServices, ProfilePicService, NotificationsModule],
})
export class ProfilesModule { }
