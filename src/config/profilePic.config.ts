import { registerAs } from '@nestjs/config';

export default registerAs('profilePic', () => ({
  defaultPicUrl:
    process.env.DEFAULT_USER_PIC || `https://i.stack.imgur.com/IHLNO.jpg`,
  versioningFormat: process.env.PIC_VERSION_TIME_FMT || 'YYYY-MM-DD-HH-mm-ss',

}));
