import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = await this.rolesService.findByName('USER');
    
    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      roles: userRole ? [userRole] : [],
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();
    return this.userRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['roles'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user || !user.password || !password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async assignRole(userId: number, roleName: string): Promise<User> {
    const user = await this.findById(userId);
    const role = await this.rolesService.findByName(roleName);
    
    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }
    
    if (!user.roles) {
      user.roles = [];
    }
    
    const hasRole = user.roles.some(r => r.name === roleName);
    if (!hasRole) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }
    
    return this.findById(userId);
  }
}

