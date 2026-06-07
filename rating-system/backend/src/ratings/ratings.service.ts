import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../entities/rating.entity';
import { Store } from '../entities/store.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(userId: string, dto: CreateRatingDto) {
    const store = await this.storesRepository.findOne({
      where: { id: dto.storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existing = await this.ratingsRepository.findOne({
      where: { userId, storeId: dto.storeId },
    });
    if (existing) {
      throw new ConflictException('You have already rated this store');
    }

    const rating = this.ratingsRepository.create({
      userId,
      storeId: dto.storeId,
      value: dto.value,
    });
    return this.ratingsRepository.save(rating);
  }

  async update(ratingId: string, userId: string, dto: UpdateRatingDto) {
    const rating = await this.ratingsRepository.findOne({
      where: { id: ratingId },
    });
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }
    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    rating.value = dto.value;
    return this.ratingsRepository.save(rating);
  }

  async getStoreRatings(storeId: string, ownerId: string) {
    const store = await this.storesRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== ownerId) {
      throw new ForbiddenException('You can only view ratings for your own store');
    }

    const ratings = await this.ratingsRepository
      .createQueryBuilder('rating')
      .leftJoin('rating.user', 'user')
      .select(['rating.id', 'rating.value', 'rating.createdAt', 'user.name'])
      .where('rating.storeId = :storeId', { storeId })
      .orderBy('rating.createdAt', 'DESC')
      .getMany();

    const avgResult = await this.ratingsRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .where('rating.storeId = :storeId', { storeId })
      .getRawOne();

    return {
      averageRating: avgResult?.avg
        ? parseFloat(parseFloat(avgResult.avg).toFixed(2))
        : null,
      ratings: ratings.map((r) => ({
        id: r.id,
        userName: r.user?.name || 'Unknown',
        value: r.value,
        createdAt: r.createdAt,
      })),
    };
  }
}
