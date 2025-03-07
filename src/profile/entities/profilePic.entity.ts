import { Column } from 'typeorm';
import 'reflect-metadata';

// Entity for saving profile pic related information of a user
export class ProfilePictureEntity {
  // name, email,phone
  @Column({ nullable: true, length: 500 })
  url: string;

  @Column({ nullable: true })
  generatedAt: string;

  constructor(url: string, generatedAt: string) {
    this.url = url;
    this.generatedAt = generatedAt;
  }
}
