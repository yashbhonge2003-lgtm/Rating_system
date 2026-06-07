import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Store } from '../entities/store.entity';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async findAll(query: {
    filterName?: string;
    filterEmail?: string;
    filterAddress?: string;
    filterRole?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const qb = this.usersRepository.createQueryBuilder('user');

    if (query.filterName) {
      qb.andWhere('user.name LIKE :name', { name: `%${query.filterName}%` });
    }
    if (query.filterEmail) {
      qb.andWhere('user.email LIKE :email', {
        email: `%${query.filterEmail}%`,
      });
    }
    if (query.filterAddress) {
      qb.andWhere('user.address LIKE :address', {
        address: `%${query.filterAddress}%`,
      });
    }
    if (query.filterRole) {
      qb.andWhere('user.role = :role', { role: query.filterRole });
    }

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const order =
        query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`user.${query.sortBy}`, order);
    } else {
      qb.orderBy('user.createdAt', 'DESC');
    }

    return qb
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.address',
        'user.role',
        'user.createdAt',
      ])
      .getMany();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result: any = { ...user };

    if (user.role === UserRole.STORE_OWNER) {
      const store = await this.storesRepository.findOne({
        where: { ownerId: user.id },
      });
      if (store) {
        const avgResult = await this.ratingsRepository
          .createQueryBuilder('rating')
          .select('AVG(rating.value)', 'avg')
          .where('rating.storeId = :storeId', { storeId: store.id })
          .getRawOne();
        result.storeAverageRating = avgResult?.avg
          ? parseFloat(parseFloat(avgResult.avg).toFixed(2))
          : null;
        result.storeName = store.name;
      }
    }

    return result;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser as any;
    return result;
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    return this.usersRepository.save(user);
  }

  async updatePassword(
    userId: string,
    requestUserId: string,
    dto: UpdatePasswordDto,
  ) {
    if (userId !== requestUserId) {
      throw new ForbiddenException('You can only update your own password');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Password updated successfully' };
  }
}
