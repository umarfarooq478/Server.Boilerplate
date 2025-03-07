import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EmergencyContactDto } from 'src/profile/dto/profiles/emergencyContact.dto';

export class SignupDto {
  @IsNotEmpty({ message: 'Please provide a valid username' })
  @IsString({ message: 'Invalid username. Usernames must be valid string' })
  @ApiProperty({
    description: 'Display Name',
    example: 'John Doe',
  })
  displayName: string;

  @IsNotEmpty({ message: 'Please provide a valid Password' })
  @IsString({ message: 'Invalid Password. must be valid string' })
  @MinLength(6, { message: 'Password must be 6 characters atleast' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Please provide a valid email' })
  @IsString({ message: 'Please provide email as a string' })
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  @ApiProperty({ example: '_@_.com' })
  email: string;


  @IsNotEmpty({ message: 'Please provide a valid country' })
  @IsString({ message: 'please provide country as a string' })
  @ApiProperty({ example: 'USA' })
  country: string;

  @IsNotEmpty({ message: 'Please provide a valid phone number' })
  @IsString({ message: 'please provide phone as a string' })
  @ApiProperty({ example: '0123456789' })
  phone: string;

  @IsNotEmpty({ message: 'Provide birthday' })
  @IsString({ message: 'enter a valid date as birthday' })
  @ApiProperty({ example: '01/01/1990' })
  birthday: string;


  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profileImage?: any;
}
