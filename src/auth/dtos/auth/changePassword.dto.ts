import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Please provide a valid Password' })
  @IsString({ message: 'Invalid Password. must be valid string' })
  @MinLength(6, { message: 'Password must be 6 characters atleast' })
  @ApiProperty()
  oldPassword: string;

  @IsNotEmpty({ message: 'Please provide a valid Password' })
  @IsString({ message: 'Invalid Password. must be valid string' })
  @MinLength(6, { message: 'Password must be 6 characters atleast' })
  @ApiProperty()
  newPassword: string;
}
