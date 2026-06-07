import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Store } from '../entities/store.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const adminExists = await this.usersRepository.findOne({
      where: { email: 'admin@platform.com' },
    });

    if (adminExists) {
      this.logger.log('Seed data already exists. Skipping...');
      return;
    }

    this.logger.log('Seeding database...');

    // Create Admin
    const admin = this.usersRepository.create({
      name: 'System Administrator Account',
      email: 'admin@platform.com',
      password: await bcrypt.hash('Admin@123', 10),
      address: 'Admin Office, Main Street, City',
      role: UserRole.ADMIN,
    });
    await this.usersRepository.save(admin);
    this.logger.log('Admin user created');

    // Create Store Owner
    const storeOwner = this.usersRepository.create({
      name: 'Default Store Owner User',
      email: 'owner@platform.com',
      password: await bcrypt.hash('Owner@123', 10),
      address: 'Owner Street, Business District, City',
      role: UserRole.STORE_OWNER,
    });
    const savedOwner = await this.usersRepository.save(storeOwner);
    this.logger.log('Store owner user created');

    // Create Normal User
    const normalUser = this.usersRepository.create({
      name: 'Default Normal Platform User',
      email: 'user@platform.com',
      password: await bcrypt.hash('User@1234', 10),
      address: 'User Lane, Residential Area, City',
      role: UserRole.USER,
    });
    await this.usersRepository.save(normalUser);
    this.logger.log('Normal user created');

    // Create Store
    const store = this.storesRepository.create({
      name: 'Default Demo Store Location',
      email: 'store@platform.com',
      address: '123 Market Street, Demo City, State',
      ownerId: savedOwner.id,
    });
    await this.storesRepository.save(store);
    this.logger.log('Demo store created');

    this.logger.log('Database seeding completed!');
  }
}
