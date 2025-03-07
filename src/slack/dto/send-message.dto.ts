import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendSlackMessageDto {
  @ApiProperty({
    description: 'Template name to use for the message',
    example: 'alert',
  })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiProperty({
    description: 'Data to populate the template',
    example: { severity: 'high', message: 'System alert' },
  })
  @IsObject()
  data: Record<string, any>;
}
