import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class LogoutDto {
  @IsOptional()
  @IsString({ message: 'Please provide User Token as a string' })
  @ApiProperty({
    description: 'User FCM token',
    required: false,
  })
  token: string;
}
