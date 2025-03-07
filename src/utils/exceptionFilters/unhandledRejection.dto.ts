import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnhandledRejectionDTO {
  @IsNotEmpty({
    message: 'reason',
  })
  @ApiProperty({
    description: 'Reason of the error',
  })
  reason: any;
}
