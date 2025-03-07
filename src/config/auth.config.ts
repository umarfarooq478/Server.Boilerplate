import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  atSecret: process.env.AT_SECRET,
  atExpiry: process.env.AT_EXPIRES_IN,
  rtSecret: process.env.RT_SECRET,
  rtExpiry: process.env.RT_EXPIRES_IN,
  verificationSecret: process.env.CONFIRMATION_SECRET,
  verificationExpiry: process.env.CONFIRMATION_EXPIRY,
  authCodeExpiry: process.env.AUTH_CODE_EXPIRY,
  forgotPasswordSecret: process.env.FORGOT_SECRET,
  forgotExpiry: process.env.FORGOT_EXPIRY,
}));
