import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FetchSingleSettingDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  key: string;
}
