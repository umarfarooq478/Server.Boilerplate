import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFlagDto {
  @IsOptional()
  @IsString({
    message: 'please provide valid feature name in form of string',
  })
  @ApiProperty({
    description: 'name of feature',
  })
  featureName?: string;

  @IsOptional()
  @IsBoolean({
    message:
      'please provide valid status of feature as boolean i.e true or false',
  })
  @ApiProperty({
    description: 'current status of feature',
  })
  featureActive?: boolean;
}
