import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SettingDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  key: string;

  @IsString()
  @ApiProperty()
  value: string;
}
