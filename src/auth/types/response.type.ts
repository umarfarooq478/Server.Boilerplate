import { ApiProperty } from '@nestjs/swagger';
import { UserDetails } from 'src/users/types';
import { Tokens } from './tokens.type';

export class LoginResponse {
  @ApiProperty({
    description: 'Section containing tokens',
  })
  tokens: Tokens;

  @ApiProperty({
    description: 'User Details',
  })
  user: UserDetails;
}
