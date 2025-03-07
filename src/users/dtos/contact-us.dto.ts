import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ContactUsDto {
  @IsNotEmpty({ message: 'Please provide a valid subject for your message' })
  @IsString({ message: 'Invalid username. Usernames must be valid string' })
  @ApiProperty({
    description: 'subject of the message',
    example: 'I have a question about the app',
  })
  subject: string;

  @IsNotEmpty({ message: 'Please provide a valid message body' })
  @IsString({ message: 'Invalid message format. must be valid string para' })
  @ApiProperty()
  message: string;
}
