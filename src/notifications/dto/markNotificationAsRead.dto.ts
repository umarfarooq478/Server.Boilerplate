import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MarkNotificationAsReadDTO {
  @IsNotEmpty({ message: 'Id should not be empty' })
  @ApiProperty({
    description: `Notification Id`,
  })
  notificationId: number;
}
