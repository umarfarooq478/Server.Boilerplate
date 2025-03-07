import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Please provide a valid email' })
  @IsString({ message: 'Please provide email as a string' })
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    },
  )
  @ApiProperty()
  email: string;
}
