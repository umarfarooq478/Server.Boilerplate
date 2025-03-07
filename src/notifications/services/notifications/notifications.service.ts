import {
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { AddNotifcationTokenDTO } from 'src/notifications/dto/addNotificationToken.dto';
import { GenerateDataNotificationDto } from 'src/notifications/dto/generateMsg.dto';
import { GenerateNotificationDTO } from 'src/notifications/dto/generateNotification.dto';
import { NotificationEntity } from 'src/notifications/entities/notification/notification.entity';
import { NotificationTokenEntity } from 'src/notifications/entities/notificationTokens/notificationTokens.entity';
import { NotificationMessage } from 'src/notifications/types/notificationMessage';
import { NotificationPayload } from 'src/notifications/types/notificationPayload';
import { TokenInfo } from 'src/notifications/types/notificationTokens';
import { NotificationType } from 'src/notifications/types/notificationType';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { FindOptionsWhere, LessThan, Repository, In } from 'typeorm';
import { FirebaseNotificationService } from '../firebase-notification/firebase-notification.service';
import { CustomLogger } from 'src/logger/services/logger.service';
import { Cron } from '@nestjs/schedule';
import {
  convertMomentToTimestamp,
  getCurrentUtcMoment,
  subtractTimeFromMoment,
} from 'src/utils/date';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    public notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationTokenEntity)
    public tokenRepository: Repository<NotificationTokenEntity>,
    public firebaseNotificationService: FirebaseNotificationService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private readonly customLogger: CustomLogger,
  ) {}

  async getNotificationTokensForUser(userId: string, limit = undefined) {
    const usersTokens = await this.tokenRepository.find({
      where: { user: { userId: userId } },
      relations: ['user'],
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    const parsedUserTokenDetails = TokenInfo.parse(usersTokens);
    return parsedUserTokenDetails;
  }

  async getNotificationTokensForUsers(usersCritera: FindOptionsWhere<User>) {
    const usersTokens = await this.tokenRepository.find({
      where: { user: usersCritera },
      relations: {
        user: true,
      },
    });
    const parsedTokens = TokenInfo.parse(usersTokens);
    return parsedTokens;
  }

  async saveTokenForUser(userId: string, addTokenDto: AddNotifcationTokenDTO) {
    try {
      const userToken = await this.tokenRepository.findOne({
        where: { fcmToken: addTokenDto.token, user: { userId } },
      });
      if (userToken) {
        await this.tokenRepository.update(
          {
            tokenId: userToken.tokenId,
          },
          {
            updatedTime: convertMomentToTimestamp(
              getCurrentUtcMoment(),
            ).toString(),
          },
        );
        return {
          status: 'Success',
          message: 'FCM token updated !',
        };
      }
      const notificationTokenDetails = new NotificationTokenEntity();
      notificationTokenDetails.user = <any>{ userId };
      notificationTokenDetails.fcmToken = addTokenDto.token;
      notificationTokenDetails.updatedTime = convertMomentToTimestamp(
        getCurrentUtcMoment(),
      ).toString();
      await this.tokenRepository.save(notificationTokenDetails);
      return notificationTokenDetails;
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
    }
  }

  async getNotificationsForUser(userId: string, limit = undefined) {
    const userNotifications = await this.notificationRepository.find({
      where: { user: { userId: userId } },
      relations: ['user'],
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    const parsedNotification = userNotifications.map((notification) =>
      NotificationMessage.parse(notification),
    );
    return parsedNotification;
  }
  async removeNotificationToken(userId: string, notificationToken: string) {
    if (notificationToken) {
      const userToken = await this.tokenRepository.findOne({
        where: { fcmToken: notificationToken, user: { userId } },
      });
      if (userToken) {
        await this.tokenRepository.delete({
          fcmToken: notificationToken,
          user: { userId },
        });
      }
    }
  }

  async generateNotificationForUser(
    generateNotificationDTO: GenerateNotificationDTO,
  ) {
    const user = await this.usersService.getUserByEmail(
      generateNotificationDTO.userEmail,
    );
    if (!user) {
      throw new ForbiddenException('User with this email doesnt exists');
    }

    // save notification in db
    const notification: NotificationEntity = new NotificationEntity();
    notification.title = generateNotificationDTO.title;
    notification.body = generateNotificationDTO.body;
    notification.notificationType =
      generateNotificationDTO?.notificationType ?? NotificationType.GENERIC;
    notification.payload = JSON.stringify(generateNotificationDTO?.payload);
    notification.isRead = false;
    notification.user = <any>{ userId: user.userId };
    await this.notificationRepository.save(notification);

    // send push notification
    const registeredTokens = await this.getNotificationTokensForUser(
      user.userId,
    );
    const deviceTokens = registeredTokens.map(
      (tokenDetails) => tokenDetails.fcmToken,
    );
    const uniqueDeviceTokens = [...new Set(deviceTokens).values()];

    if (uniqueDeviceTokens && uniqueDeviceTokens.length > 0) {
      const pushNotificationData: BaseMessage = {
        notification: {
          title: generateNotificationDTO.title,
          body: generateNotificationDTO.body,
        },
        data: {
          ...(generateNotificationDTO?.payload ?? {}),
          notificationType:
            generateNotificationDTO?.notificationType ??
            NotificationType.GENERIC,
        },
      };
      this.firebaseNotificationService.sendNotificationToDevices(
        uniqueDeviceTokens,
        pushNotificationData,
      );
    }
    return NotificationMessage.parse(notification);
  }

  async generateNotificationForUserById({
    userId,
    title,
    payload,
    body,
    notificationType,
  }: {
    userId: string;
    title: string;
    payload: any;
    body: string;
    notificationType: NotificationType;
  }) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new ForbiddenException('User with this email doesnt exists');
    }

    // save notification in db
    const notification: NotificationEntity = new NotificationEntity();
    notification.title = title;
    notification.body = body;
    notification.notificationType =
      notificationType ?? NotificationType.GENERIC;
    notification.payload = JSON.stringify(payload);
    notification.isRead = false;
    notification.user = <any>{ userId: user.userId };
    await this.notificationRepository.save(notification);

    // send push notification
    const registeredTokens = await this.getNotificationTokensForUser(
      user.userId,
    );
    const deviceTokens = registeredTokens.map(
      (tokenDetails) => tokenDetails.fcmToken,
    );
    const uniqueDeviceTokens = [...new Set(deviceTokens).values()];

    if (uniqueDeviceTokens && uniqueDeviceTokens.length > 0) {
      const pushNotificationData: BaseMessage = {
        notification: {
          title: title,
          body: body,
        },
        data: {
          ...(payload ?? {}),
          notificationType: notificationType ?? NotificationType.GENERIC,
        },
      };
      this.firebaseNotificationService.sendNotificationToDevices(
        uniqueDeviceTokens,
        pushNotificationData,
      );
    }
    return NotificationMessage.parse(notification);
  }

  async generateNotificationForMultipleUsers(
    notificationPayload: NotificationPayload,
    usersCritera: FindOptionsWhere<User>,
  ) {
    const users = await this.usersService.getUsersByCriteria(usersCritera);
    if (users) {
      // save notifications in db for all the users
      const notifications = users.map((user) => {
        const notification: NotificationEntity = new NotificationEntity();
        notification.title = notificationPayload.title;
        notification.body = notificationPayload.body;
        notification.notificationType =
          notificationPayload?.notificationType ?? NotificationType.GENERIC;
        notification.payload = JSON.stringify(notificationPayload?.payload);
        notification.isRead = false;
        notification.user = <any>{ userId: user.userId };
        return notification;
      });
      await this.notificationRepository.save(notifications);
      // send push notifications to all the relevant users
      const registeredTokens = await this.getNotificationTokensForUsers(
        usersCritera,
      );
      const deviceTokens = registeredTokens.map(
        (tokenDetails) => tokenDetails.fcmToken,
      );
      const uniqueDeviceTokens = [...new Set(deviceTokens).values()];
      if (uniqueDeviceTokens && uniqueDeviceTokens.length > 0) {
        const pushNotificationData: BaseMessage = {
          notification: {
            title: notificationPayload.title,
            body: notificationPayload.body,
          },
          data: {
            ...(notificationPayload?.payload ?? {}),
            notificationType:
              notificationPayload?.notificationType ?? NotificationType.GENERIC,
          },
        };
        this.firebaseNotificationService.sendNotificationToDevices(
          uniqueDeviceTokens,
          pushNotificationData,
        );
      }
    }
  }

  async generateDataMessageForMultipleUsers(
    generateMessageDto: GenerateDataNotificationDto,
  ) {
    const users = await this.usersService.getUsersByCriteria({
      email: generateMessageDto.userEmail,
    });
    if (users) {
      // send push notifications to all the relevant users
      const registeredTokens = await this.getNotificationTokensForUsers({
        email: generateMessageDto.userEmail,
      });
      const deviceTokens = registeredTokens.map(
        (tokenDetails) => tokenDetails.fcmToken,
      );
      const uniqueDeviceTokens = [...new Set(deviceTokens).values()];
      if (uniqueDeviceTokens && uniqueDeviceTokens.length > 0) {
        const pushNotificationData: BaseMessage = {
          data: {
            ...generateMessageDto.payload,
            notificationType: generateMessageDto.notificationType,
          },
        };
        this.firebaseNotificationService.sendNotificationToDevices(
          uniqueDeviceTokens,
          pushNotificationData,
        );
      }
    }
  }

  async markNotificationAsRead(userId: string, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { notificationId, user: { userId } },
    });
    if (notification) {
      if (!notification.isRead) {
        await this.notificationRepository.update(
          { notificationId, user: { userId } },
          { isRead: true },
        );
      }
    }
  }

  async getUnreadNotificationCount(userId: string) {
    const userNotifications = await this.notificationRepository.find({
      where: { user: { userId: userId }, isRead: false },
      relations: ['user'],
    });
    const unreadCount = userNotifications.length;
    return unreadCount;
  }

  async markOwnNotificationsAsRead(userId: string) {
    await this.notificationRepository.update(
      { isRead: false, user: { userId } },
      { isRead: true },
    );
    return {
      status: 'success',
      message: 'notifications updated successfully !',
    };
  }
  @Cron('0 0 * * *', {
    timeZone: 'America/Los_Angeles',
  })
  async cleanUpFCMTokens() {
    let timeBefore2Months: any = subtractTimeFromMoment(
      getCurrentUtcMoment(),
      60 * 24 * 60,
    );
    timeBefore2Months = convertMomentToTimestamp(timeBefore2Months);
    const fcmTokens = await this.tokenRepository.find({
      where: {
        updatedTime: LessThan(timeBefore2Months),
      },
    });
    const fcmTokensList = [];
    fcmTokens.forEach((token) => {
      fcmTokensList.push(token.fcmToken);
    });
    this.tokenRepository.delete({
      fcmToken: In(fcmTokensList),
    });
  }
}
