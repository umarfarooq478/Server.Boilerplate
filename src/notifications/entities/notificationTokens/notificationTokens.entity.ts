import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('NotificationToken')
export class NotificationTokenEntity {
  @PrimaryGeneratedColumn()
  tokenId: number;

  @ApiProperty({
    description: 'FCM token for the user',
  })
  @Column({ unique: true })
  fcmToken: string;

  @ApiProperty({
    description: 'FCM token for the user',
  })
  @Column({ type: 'bigint', nullable: true })
  updatedTime: string;
  @ApiProperty({
    description: 'Token updated Time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.notificationTokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
