import { ApiProperty } from '@nestjs/swagger';
import { NotificationTokenEntity } from 'src/notifications/entities/notificationTokens/notificationTokens.entity';
import { ProfilePictureEntity } from 'src/profile/entities/profilePic.entity';
import { Role } from 'src/users/roles/roles.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @ApiProperty({
    description: 'User Creation Date',
  })
  @CreateDateColumn()
  CreatedAt: Date;


  @ApiProperty({
    description: 'User Updation Date',
  })
  @Column({ nullable: true })
  UpdatedAt: Date;

  @Column({ nullable: true })
  hashedRt: string;

  @ApiProperty({
    description: 'User Display Name',
  })
  @Column()
  displayName: string;

  @Column({ select: false })
  password: string;

  @ApiProperty()
  @Column()
  email: string;


  @ApiProperty()
  @Column()
  country: string;

  @ApiProperty({ description: 'Phone number' })
  @Column()
  phone: string;

  @ApiProperty({ description: 'Date of birth' })
  @Column()
  birthday: string;

  @Column({ nullable: true })
  ResetToken: string;

  @Column(() => ProfilePictureEntity)
  profilePicDetails: ProfilePictureEntity;

  @Column('boolean', { default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Client,
  })
  role: Role;



  @OneToMany(
    () => NotificationTokenEntity,
    (notificationToken) => notificationToken.user,
    {
      cascade: true,
    },
  )
  notificationTokens: NotificationTokenEntity[];

}
