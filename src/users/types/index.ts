import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserDetails extends OmitType(User, [
  // '_id',
  'password',
  'hashedRt',
  'isVerified',
  'ResetToken',
] as const) {
  @ApiProperty({
    description: 'Instagram profile picture link',
  })
  profilePic?: string;

  @ApiProperty({
    description: 'Number of unread notifications',
  })
  unreadNotificationCount?: number;
}
