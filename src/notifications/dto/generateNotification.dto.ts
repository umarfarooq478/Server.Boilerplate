import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { NotificationType } from '../types/notificationType';

export class GenerateNotificationDTO {
  @ApiProperty({
    description: 'User Email',
    required: true,
  })
  @IsNotEmpty({
    message: 'Please select the email of the user to send notification to',
  })
  userEmail?: string;

  @ApiProperty({
    description: 'Notification Title',
    required: true,
  })
  @IsNotEmpty({ message: 'Please provide a title for the notification' })
  title: string;

  @ApiProperty({
    description: 'Message Details',
    required: true,
  })
  @Allow()
  body?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  @ApiPropertyOptional()
  notificationType?: NotificationType;

  @ApiProperty({
    description: 'Notification optional payload .',
  })
  @IsOptional()
  payload: any;
}
