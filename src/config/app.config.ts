import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const port = parseInt(process.env.APP_PORT || process.env.PORT || '3000', 10);
  return {
    port,
    baseUrl: process.env.WEB_URL || 'https//verification-site.vercel.app/',
    apiPrefix: process.env.API_PREFIX || 'api',
    environmentPrefix: process.env.ENV_PREFIX ?? 'DEV',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    resetPasswordPageUrl: `${process.env.WEB_URL}/reset-password`,
    verifyUserPageUrl: `${process.env.WEB_URL}/verifiy-user`,
    deleteUserPageUrl: `${process.env.WEB_URL}/delete-user`,
    version: process.env.version || '0.1',
    otpLoginPageUrl: `${process.env.WEB_URL}/otp-login`,
    otpLoginPageUrlTest: `http://localhost:3000/otp-login`,
    randomAvatarApiUrl: 'https://avatar.iran.liara.run/public',
    deleteUserOtpExpiry: process.env.DELETE_USER_OTP_EXPIRY || 60,
    awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    AWSLogGroup: process.env.AWS_LOG_GROUP ?? 'SERVER-LOGS',
    logFlushInterval: process.env.LOG_FLUSH_INTERVAL ?? 1000 * 60 * 1,
    maxLogsToKeepInMemory: process.env.MAX_LOGS_IN_MEMORY ?? 2,


    slackWebhookUrl: process.env.SLACK_WEB_HOOK_URL,
  };
});
