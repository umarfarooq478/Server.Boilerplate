import { ApiProperty } from '@nestjs/swagger';

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Code')
export class Code {
  @ApiProperty({
    description: 'code issued ',
  })
  @PrimaryColumn()
  code: string;

  @ApiProperty({
    description: 'code issued for',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'creation date',
  })
  @Column()
  createdAt: string;
}
