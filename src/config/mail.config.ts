import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  emailHost: process.env.EMAIL_HOST,
  emailSender: process.env.EMAIL_SENDER,
  emailUser: process.env.GMAIL_USER,
  emailPassword: process.env.GMAIL_APP_PASSWORD,
  emailSenderUrl:
    process.env.EMAIL_SENDER_URL ||
    'https://cu8wv8haxd.execute-api.us-east-1.amazonaws.com/EmailSendingService',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@server.com',
}));
