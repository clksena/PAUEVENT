import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  getMyRegistrations(@Request() req) {
    // Temporary debug log to verify req.user shape
    console.log('req.user:', JSON.stringify(req.user, null, 2));
    
    // Normalize user ID - support both id, userId, and sub
    const userId = req.user?.id ?? req.user?.userId ?? req.user?.sub;
    if (!userId) {
      console.error('Missing user ID in req.user:', req.user);
      throw new UnauthorizedException('User ID not found in request');
    }
    
    return this.registrationsService.getUserRegistrations(Number(userId));
  }

  @Post('events/:eventId')
  @UseGuards(JwtAuthGuard)
  register(@Param('eventId') eventId: string, @Request() req) {
    return this.registrationsService.register(req.user.id, +eventId);
  }

  @Delete('events/:eventId')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('eventId') eventId: string, @Request() req) {
    return this.registrationsService.cancel(req.user.id, +eventId);
  }

  @Get('events/:eventId/participants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getEventParticipants(@Param('eventId') eventId: string, @Request() req) {
    return this.registrationsService.getEventParticipants(+eventId, req.user.id);
  }
}

