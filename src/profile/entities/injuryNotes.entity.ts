import { Column, CreateDateColumn } from 'typeorm';
import 'reflect-metadata';

export class InjuryNoteEntity {
  @Column()
  injuryNote: string;

  @CreateDateColumn()
  CreatedAt: Date;

  constructor(injuryNote: string) {
    this.injuryNote = injuryNote;
  }
}
