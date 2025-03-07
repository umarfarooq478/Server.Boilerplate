import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateFlagDto {
  @IsNotEmpty({
    message: 'please provide valid feature Name',
  })
  @IsString({
    message: 'please provide valid feature name in form of string',
  })
  @ApiProperty({
    description: 'name of feature',
  })
  featureName: string;

  @IsNotEmpty({
    message: 'please provide valid status of feature',
  })
  @IsBoolean({
    message:
      'please provide valid status of feature as boolean i.e true or false',
  })
  @ApiProperty({
    description: 'current status of feature',
  })
  featureActive: boolean;
}
