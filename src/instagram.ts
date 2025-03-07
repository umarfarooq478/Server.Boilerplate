import { IgApiClient } from 'instagram-private-api';
import * as dotenv from 'dotenv';
import { BadRequestException } from '@nestjs/common';
dotenv.config();

const instagramApiClient = new IgApiClient();
instagramApiClient.state.generateDevice(process.env.IG_USERNAME);
const isInstagramLoginDisabled = process.env.IG_LOGIN_DISABLED;
if (!isInstagramLoginDisabled) {
  try {
    instagramApiClient.account.login(
      process.env.IG_USERNAME,
      process.env.IG_PASSWORD,
    );
  } catch (error) {
    console.log('error logging in instagram', error);
  }
}

export { instagramApiClient };
