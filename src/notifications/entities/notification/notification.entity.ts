import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from 'src/notifications/types/notificationType';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Notification')
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @ApiProperty({
    description: 'Notification Title',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Notification Body',
  })
  @Column({ type: 'varchar', length: 500 })
  body: string;

  @ApiProperty({
    description: 'Notification type.',
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERIC,
  })
  notificationType: NotificationType;

  @ApiProperty({
    description: 'optional payload in the notification stored as json string.',
  })
  @Column({
    default: '',
  })
  payload: string;

  @ApiProperty({
    description: 'Notification Creation Time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Has notification been read',
    default: false,
  })
  @Column()
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notificationTokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
