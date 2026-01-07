import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    // Initialize roles if they don't exist
    const adminRole = await this.roleRepository.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      await this.roleRepository.save({ name: 'ADMIN' });
    }

    const userRole = await this.roleRepository.findOne({ where: { name: 'USER' } });
    if (!userRole) {
      await this.roleRepository.save({ name: 'USER' });
    }
  }

  async findByName(name: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async create(name: string): Promise<Role> {
    const role = this.roleRepository.create({ name });
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }
}
