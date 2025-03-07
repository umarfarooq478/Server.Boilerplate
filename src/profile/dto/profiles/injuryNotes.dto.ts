import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class InjuryNotesDto {
  @IsString({ message: 'Injury must be a string' })
  @ApiProperty()
  injuryNote: string;
}
