import { ApiProperty } from '@nestjs/swagger';

export class GetNotificationTokensQueryDTO {
  @ApiProperty({
    description: 'Number of tokens to fetch',
    required: false,
  })
  limit?: number;
}
