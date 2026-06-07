import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Rating } from '../entities/rating.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async getAdminDashboard() {
    const totalUsers = await this.usersRepository.count();
    const totalStores = await this.storesRepository.count();
    const totalRatings = await this.ratingsRepository.count();

    return { totalUsers, totalStores, totalRatings };
  }

  async getStoreOwnerDashboard(ownerId: string) {
    const store = await this.storesRepository.findOne({
      where: { ownerId },
    });

    if (!store) {
      return { averageRating: null, totalRatings: 0, ratings: [] };
    }

    const ratings = await this.ratingsRepository
      .createQueryBuilder('rating')
      .leftJoin('rating.user', 'user')
      .select(['rating.id', 'rating.value', 'rating.createdAt', 'user.name'])
      .where('rating.storeId = :storeId', { storeId: store.id })
      .orderBy('rating.createdAt', 'DESC')
      .getMany();

    const avgResult = await this.ratingsRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .where('rating.storeId = :storeId', { storeId: store.id })
      .getRawOne();

    return {
      storeName: store.name,
      storeId: store.id,
      averageRating: avgResult?.avg
        ? parseFloat(parseFloat(avgResult.avg).toFixed(2))
        : null,
      totalRatings: ratings.length,
      ratings: ratings.map((r) => ({
        id: r.id,
        userName: r.user?.name || 'Unknown',
        value: r.value,
        createdAt: r.createdAt,
      })),
    };
  }
}
