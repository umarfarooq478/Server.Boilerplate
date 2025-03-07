import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { NotificationsController } from './controllers/notifications/notifications.controller';
import { NotificationEntity } from './entities/notification/notification.entity';
import { NotificationTokenEntity } from './entities/notificationTokens/notificationTokens.entity';
import { FirebaseNotificationService } from './services/firebase-notification/firebase-notification.service';
import { NotificationsService } from './services/notifications/notifications.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationTokenEntity, NotificationEntity]),
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseNotificationService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
