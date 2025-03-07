import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Please provide a valid password' })
  @IsString({
    message: 'Please provide a valid password as string of 6 - 10 characters',
  })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'token not found' })
  @IsString({
    message: 'token must be string',
  })
  @ApiProperty()
  token: string;
}
