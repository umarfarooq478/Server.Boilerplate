import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('Stub')
export class Stub {
  @ApiProperty({
    description: 'Unique ID',
  })
  @PrimaryColumn()
  stubId: string;

  @Column()
  @ApiProperty({
    description: 'Stub',
  })
  stubDesc: string;
}
