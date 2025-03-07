import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeletionOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  otp: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  expiryDate: Date;
}
