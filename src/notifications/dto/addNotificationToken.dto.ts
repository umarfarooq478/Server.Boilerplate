import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddNotifcationTokenDTO {
  @IsNotEmpty({ message: 'This should not be empty' })
  @ApiProperty({
    description: `FCM token to register for user`,
  })
  token: string;
}
