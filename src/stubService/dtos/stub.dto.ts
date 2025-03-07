import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStubDto {
  @IsNotEmpty({
    message: 'please provide valid information',
  })
  @IsString({
    message: 'please provide valid information',
  })
  @ApiProperty({
    description: 'please provide valid information',
  })
  stubTitle: string;
}
