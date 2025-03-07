import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
export class LoginDto {
  @IsNotEmpty({ message: 'Please provide a valid email' })
  @IsString({ message: 'Please provide email as a string' })
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  @ApiProperty({
    description: 'User Email',
  })
  email: string;

  @IsNotEmpty({ message: 'Please provide a valid Password' })
  @IsString({ message: 'Invalid Password. must be valid string' })
  @MinLength(6, { message: 'Password must be 6 characters atleast' })
  // @MaxLength(10, { message: 'Passwords cannot be longer than 10 characters' })
  @ApiProperty({
    description: 'User Password',
  })
  password: string;
}
