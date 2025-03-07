import { NotificationType } from './notificationType';

// todo: insert a url for navigation. insert a notificationType to discern between different types of notifications
export class NotificationPayload {
  title: string;
  body?: string;
  notificationType?: NotificationType;
  payload?: Record<string, any>;
}

export class DataMessagePayload {
  // token: string;
  data: Record<string, string>;
  notificationType: NotificationType;
}
