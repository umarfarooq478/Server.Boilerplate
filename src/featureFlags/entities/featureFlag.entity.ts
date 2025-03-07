import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('FeatureFlag')
export class FeatureFlag {
  @PrimaryColumn()
  @ApiProperty({
    description: 'feature name.',
    example: 'One X One',
  })
  featureName: string;

  @Column()
  @ApiProperty({
    description:
      'feature status. it could be true or false i.e active or in active.',
    example: 'true || false',
  })
  featureActive: boolean;
}
