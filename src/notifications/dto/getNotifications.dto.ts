import { ApiProperty } from '@nestjs/swagger';

export class GetNotificationsQueryDTO {
  @ApiProperty({
    description: 'Number of notifications to fetch',
    required: false,
  })
  limit?: number;
}
