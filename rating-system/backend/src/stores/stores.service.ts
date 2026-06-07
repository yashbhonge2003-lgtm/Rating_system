import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { Rating } from '../entities/rating.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(
    userId: string,
    query: {
      searchName?: string;
      searchAddress?: string;
      sortBy?: string;
      sortOrder?: string;
    },
  ) {
    const qb = this.storesRepository
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .addSelect('AVG(rating.value)', 'avgRating')
      .leftJoin(
        'store.ratings',
        'userRating',
        'userRating.userId = :userId',
        { userId },
      )
      .addSelect('userRating.value', 'userRatingValue')
      .addSelect('userRating.id', 'userRatingId')
      .groupBy('store.id')
      .addGroupBy('userRating.value')
      .addGroupBy('userRating.id');

    if (query.searchName) {
      qb.andWhere('store.name LIKE :name', {
        name: `%${query.searchName}%`,
      });
    }
    if (query.searchAddress) {
      qb.andWhere('store.address LIKE :address', {
        address: `%${query.searchAddress}%`,
      });
    }

    const validSortFields = ['name', 'address'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const order =
        query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`store.${query.sortBy}`, order);
    } else if (query.sortBy === 'averageRating') {
      const order =
        query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy('avgRating', order);
    } else {
      qb.orderBy('store.createdAt', 'DESC');
    }

    const rawResults = await qb.getRawAndEntities();

    return rawResults.raw.map((raw, index) => ({
      id: raw.store_id,
      name: raw.store_name,
      address: raw.store_address,
      averageRating: raw.avgRating
        ? parseFloat(parseFloat(raw.avgRating).toFixed(2))
        : null,
      currentUserRating: raw.userRatingValue || null,
      currentUserRatingId: raw.userRatingId || null,
    }));
  }

  async findAllAdmin(query: {
    filterName?: string;
    filterEmail?: string;
    filterAddress?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const qb = this.storesRepository
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .addSelect('AVG(rating.value)', 'avgRating')
      .groupBy('store.id');

    if (query.filterName) {
      qb.andWhere('store.name LIKE :name', { name: `%${query.filterName}%` });
    }
    if (query.filterEmail) {
      qb.andWhere('store.email LIKE :email', { email: `%${query.filterEmail}%` });
    }
    if (query.filterAddress) {
      qb.andWhere('store.address LIKE :address', {
        address: `%${query.filterAddress}%`,
      });
    }

    const validSortFields = ['name', 'email', 'address'];
    if (query.sortBy && validSortFields.includes(query.sortBy)) {
      const order =
        query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`store.${query.sortBy}`, order);
    } else if (query.sortBy === 'averageRating') {
      const order =
        query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy('avgRating', order);
    } else {
      qb.orderBy('store.createdAt', 'DESC');
    }

    const rawResults = await qb.getRawAndEntities();

    return rawResults.raw.map((raw) => ({
      id: raw.store_id,
      name: raw.store_name,
      email: raw.store_email,
      address: raw.store_address,
      averageRating: raw.avgRating
        ? parseFloat(parseFloat(raw.avgRating).toFixed(2))
        : null,
    }));
  }

  async create(dto: CreateStoreDto) {
    const owner = await this.usersRepository.findOne({
      where: { id: dto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    if (owner.role !== UserRole.STORE_OWNER) {
      throw new BadRequestException('Assigned user must have the store_owner role');
    }

    const existingStore = await this.storesRepository.findOne({
      where: { email: dto.email },
    });
    if (existingStore) {
      throw new ConflictException('Store email already exists');
    }

    const store = this.storesRepository.create(dto);
    return this.storesRepository.save(store);
  }

  async findOne(id: string) {
    const store = await this.storesRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async update(id: string, dto: CreateStoreDto) {
    const store = await this.findOne(id);

    const owner = await this.usersRepository.findOne({
      where: { id: dto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    if (owner.role !== UserRole.STORE_OWNER) {
      throw new BadRequestException('Assigned user must have the store_owner role');
    }

    // Check if updating to an email that belongs to another store
    if (dto.email !== store.email) {
      const existing = await this.storesRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Store email already exists');
      }
    }

    store.name = dto.name;
    store.email = dto.email;
    store.address = dto.address ?? store.address;  // keep existing if not provided
    store.owner = owner;
    store.ownerId = dto.ownerId;

    return this.storesRepository.save(store);
  }
}
