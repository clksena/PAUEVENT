import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async onModuleInit() {
    // Only run seeding in development mode
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      // Ensure ADMIN role exists
      let adminRole = await this.rolesService.findByName('ADMIN');
      if (!adminRole) {
        adminRole = await this.rolesService.create('ADMIN');
        this.logger.log('ADMIN role created');
      }

      // Check if admin user already exists
      const adminEmail = 'admin@test.com';
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail.toLowerCase() },
        relations: ['roles'],
      });

      if (existingAdmin) {
        // Check if user has ADMIN role, assign if missing
        const hasAdminRole = existingAdmin.roles?.some(r => r.name === 'ADMIN');
        if (!hasAdminRole) {
          existingAdmin.roles = [...(existingAdmin.roles || []), adminRole];
          await this.userRepository.save(existingAdmin);
          this.logger.log('ADMIN role assigned to existing admin user');
        }
        return; // Admin user already exists, skip creation
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const adminUser = this.userRepository.create({
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: [adminRole],
      });

      await this.userRepository.save(adminUser);
      
      // Log credentials only in development
      this.logger.log('========================================');
      this.logger.log('Default ADMIN user created:');
      this.logger.log(`Email: ${adminEmail}`);
      this.logger.log('Password: Admin123!');
      this.logger.log('========================================');
    } catch (error) {
      this.logger.error('Error seeding admin user:', error);
    }
  }
}

