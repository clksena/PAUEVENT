import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRegistration } from './entities/event-registration.entity';
import { EventsService } from '../events/events.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(EventRegistration)
    private registrationRepository: Repository<EventRegistration>,
    private eventsService: EventsService,
  ) {}

  async register(userId: number, eventId: number): Promise<EventRegistration> {
    const event = await this.eventsService.findOne(eventId);
    
    const existingRegistration = await this.registrationRepository.findOne({
      where: { userId, eventId },
    });
    
    if (existingRegistration) {
      throw new BadRequestException('User is already registered for this event');
    }
    
    const registrations = await this.registrationRepository.find({
      where: { eventId },
    });
    
    if (registrations.length >= event.maxParticipants) {
      throw new BadRequestException('Event is full');
    }
    
    const registration = this.registrationRepository.create({
      userId,
      eventId,
    });
    
    return this.registrationRepository.save(registration);
  }

  async cancel(userId: number, eventId: number): Promise<void> {
    const registration = await this.registrationRepository.findOne({
      where: { userId, eventId },
    });
    
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    
    await this.registrationRepository.remove(registration);
  }

  async getEventParticipants(eventId: number, userId: number): Promise<EventRegistration[]> {
    const event = await this.eventsService.findOne(eventId);
    
    if (event.createdById !== userId) {
      throw new ForbiddenException('Only the event creator can view participants');
    }
    
    return this.registrationRepository.find({
      where: { eventId },
      relations: ['user'],
    });
  }

  async getUserRegistrations(userId: number): Promise<EventRegistration[]> {
    // Always return empty array if userId is missing/invalid - never throw Unauthorized
    if (!userId || isNaN(Number(userId))) {
      return [];
    }
    
    try {
      const registrations = await this.registrationRepository.find({
        where: { userId: Number(userId) },
        relations: ['event', 'event.creator'],
      });
      // Always return an array, never throw for missing registrations
      return Array.isArray(registrations) ? registrations : [];
    } catch (error) {
      // Log error but return empty array instead of throwing
      console.error('Error fetching user registrations:', error);
      return [];
    }
  }
}

