import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('store-owner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STORE_OWNER)
  async getStoreOwnerDashboard(@Request() req) {
    return this.dashboardService.getStoreOwnerDashboard(req.user.id);
  }
}
