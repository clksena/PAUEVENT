import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: number;

  @CreateDateColumn()
  registeredAt: Date;
}

