import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class EmergencyContactDto {
  @IsNotEmpty({ message: 'Please provide a valid name' })
  @IsString({ message: 'Invalid name Usernames must be valid string' })
  @ApiProperty({ example: 'Emergency' })
  name: string;

  @IsNotEmpty({ message: 'Please provide a valid email' })
  @IsString({ message: 'Please provide email as a string' })
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  @ApiProperty({ example: 'emergency@emergency.com' })
  email: string;

  @IsNotEmpty({ message: 'Please provide a valid phone number' })
  @IsString({ message: 'please provide phone as a string' })
  @ApiProperty({ example: '123456789' })
  phone: string;
}
