import { PickType } from '@nestjs/swagger';
import { GenerateNotificationDTO } from './generateNotification.dto';

export class GenerateDataNotificationDto extends PickType(
  GenerateNotificationDTO,
  ['notificationType', 'payload', 'userEmail'],
) {}
