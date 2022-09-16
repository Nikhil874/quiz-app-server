import { User } from '../users/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { string } from 'joi';

export interface IOption {
  text: string;
  isCorrect: boolean;
}
export interface IQuestion {
  question: string;

  options: IOption[];
}

@Entity()
export class Quiz extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column('simple-json')
  questions: IQuestion[];
  @ManyToOne(() => User, (user) => user.quizes)
  user: User;
  @Column({ default: false })
  isPublished: boolean;
  @Column({ default: null })
  permaLink: string;
}
