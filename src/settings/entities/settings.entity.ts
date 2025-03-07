import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Setting {
  @ApiProperty()
  @Column()
  @PrimaryColumn()
  key: string;

  @ApiProperty()
  @Column({ nullable: true })
  value: string;
}
