import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebaseAdmin from 'firebase-admin';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { BaseMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { CustomLogger } from 'src/logger/services/logger.service';
import { LOG_LEVEL } from 'src/logger/types/log';

@Injectable()
export class FirebaseNotificationService {
  firebaseMessenger: Messaging;
  constructor(
    private configService: ConfigService,
    private readonly customLogger: CustomLogger,
  ) {
    const firebaseServiceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT,
    );
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
    });

    this.firebaseMessenger = firebaseAdmin.messaging();
  }

  /**
   * The function `sendNotificationToDevices` sends notifications to multiple devices using Firebase
   * Cloud Messaging tokens.
   * @param {string[]} fcmTokens - The `fcmTokens` parameter is an array of Firebase Cloud Messaging
   * (FCM) tokens representing the devices to which the notification will be sent. Each token is a
   * unique identifier for a specific device that is registered to receive push notifications.
   * @param {BaseMessage} notificationData - The `notificationData` parameter is an object of type
   * `BaseMessage` that contains the data needed to send a notification to the devices.
   */
  async sendNotificationToDevices(
    fcmTokens: string[],
    notificationData: BaseMessage,
  ) {
    try {
      fcmTokens.forEach(async (token) => {
        const message = {
          ...notificationData,
          token: token,
        };
        
        const notificationPushed = await this.firebaseMessenger.send(message);
        this.customLogger.addLog(
          {
            message:
              'Notification pushed ' +
              notificationPushed +
              ' with token ' +
              token,
            topicName: 'NOTIFICATIONS',
          },
          LOG_LEVEL.Info,
        );
      });
    } catch (err) {
      this.customLogger.error({
        message: `${err}`,
        stack: err.stack,
        topicName: 'Exception Logs',
      });
    }
  }
}
