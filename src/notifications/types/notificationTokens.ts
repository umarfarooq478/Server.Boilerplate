import { OmitType } from '@nestjs/swagger';
import { NotificationTokenEntity } from '../entities/notificationTokens/notificationTokens.entity';

export class TokenInfo extends OmitType(NotificationTokenEntity, [
  'user',
] as const) {
  static parse(tokensDetails: NotificationTokenEntity[]) {
    const parsedTokensDetails = tokensDetails.map((tokenDetails) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { user, ...propsToKeep } = tokenDetails;
      return { ...propsToKeep } as TokenInfo;
    });
    return parsedTokensDetails;
  }
}
