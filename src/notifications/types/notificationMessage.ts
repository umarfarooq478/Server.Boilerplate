import { OmitType } from '@nestjs/swagger';
import { NotificationEntity } from '../entities/notification/notification.entity';

export class NotificationMessage extends OmitType(NotificationEntity, [
  'user',
] as const) {
  static parse(notification: NotificationEntity) {
    const { user, payload, ...propsToKeep } = notification;
    let parsedPayload = {};
    try {
      if (payload) {
        parsedPayload = JSON.parse(payload);
      }
    } catch (e) {
      console.log(e);
    }

    return {
      ...propsToKeep,
      payload: parsedPayload,
    } as NotificationMessage;
  }
}
