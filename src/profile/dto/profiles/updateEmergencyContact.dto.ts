import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateEmergencyContactDto {
  @IsString({ message: 'Invalid name Usernames must be valid string' })
  @IsOptional()
  @ApiProperty({ required: false })
  name: string;

  @IsOptional()
  @IsString({ message: 'Please provide email as a string' })
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  @ApiProperty({ required: false })
  email: string;

  @IsOptional()
  @IsString({ message: 'please provide phone as a string' })
  @ApiProperty({ required: false })
  phone: string;
}
