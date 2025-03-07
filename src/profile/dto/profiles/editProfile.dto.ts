import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

import { Role } from 'src/users/roles/roles.enum';
export class EditProfileDto {
  @IsOptional()
  @IsString({ message: 'Invalid username. Usernames must be valid string' })
  @ApiProperty({ required: false })
  displayName: string;

  @IsOptional()
  @IsString({ message: 'Please provide instagram username as a string' })
  @ApiProperty({ required: false })
  instagramUser: string;

  @IsOptional()
  @IsString({ message: 'please provide country as a string' })
  @ApiProperty({ required: false })
  country: string;

  @IsOptional()
  @IsString({ message: 'please provide phone as a string' })
  @ApiProperty({ required: false })
  phone: string;

  @IsOptional()
  @IsString({ message: 'enter a valid date as birthday' })
  @ApiProperty({ required: false })
  birthday: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({ required: false })
  role?: Role;



  @IsOptional()
  @IsString({ message: 'enter a valid payout ID' })
  @ApiProperty({ required: false })
  payoutID: string;
}
