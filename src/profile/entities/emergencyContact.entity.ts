import { Column, CreateDateColumn } from 'typeorm';
import 'reflect-metadata';

export class EmergencyContactEntity {
  // name, email,phone
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  createdAt: string;

  constructor(name?: string, email?: string, phone?: string) {
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
}
