import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserToAuthenticateDTO {
  @IsNotEmpty({ message: 'please provide code' })
  @IsString({ message: 'code is' })
  @ApiProperty({
    description: 'userIds',
  })
  code: string;
}
