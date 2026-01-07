import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      date: new Date(createEventDto.date),
      createdById: userId,
    });
    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['creator', 'registrations'],
      order: { date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator', 'registrations', 'registrations.user'],
    });
    
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    return event;
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    userId: number,
  ): Promise<Event> {
    const event = await this.findOne(id);
    
    if (event.createdById !== userId) {
      throw new ForbiddenException('Only the event creator can update this event');
    }
    
    Object.assign(event, {
      ...updateEventDto,
      date: updateEventDto.date ? new Date(updateEventDto.date) : event.date,
    });
    
    return this.eventRepository.save(event);
  }

  async remove(id: number, userId: number): Promise<void> {
    const event = await this.findOne(id);
    
    if (event.createdById !== userId) {
      throw new ForbiddenException('Only the event creator can delete this event');
    }
    
    await this.eventRepository.remove(event);
  }
}

