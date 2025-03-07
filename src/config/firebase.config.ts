import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => {
  if (!process.env.FIREBASE_CREDENTIALS) {
    console.error('Firebase credentails missing!!!');
    throw new Error('Firebase credentails missing');
  }
  const credsString = process.env.FIREBASE_CREDENTIALS || '';
  const parsedCreds = JSON.parse(credsString);
  parsedCreds.private_key = parsedCreds.private_key.replace(/\\n/gm, '\n');
  return {
    credentials: parsedCreds,

  };
});
