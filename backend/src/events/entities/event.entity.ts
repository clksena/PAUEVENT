import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EventRegistration } from '../../registrations/entities/event-registration.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column('timestamp')
  date: Date;

  @Column({ default: 100 })
  maxParticipants: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  creator: User;

  @Column()
  createdById: number;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations: EventRegistration[];
}

