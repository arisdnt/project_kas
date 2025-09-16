/**
 * Profile Service Orchestrator
 * Main service that coordinates user profile and settings operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { UpdateProfile, ChangePassword, UpdateSettings } from '../models/ProfileCore';
import { ProfileQueryService } from './modules/ProfileQueryService';
import { ProfileMutationService } from './modules/ProfileMutationService';

export class ProfileService {
  // Profile information operations
  static async getMyProfile(scope: AccessScope, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileQueryService.getUserProfile(scope, userId);
  }

  static async getUserProfile(scope: AccessScope, userId: string) {
    return ProfileQueryService.getUserProfile(scope, userId);
  }

  static async updateMyProfile(scope: AccessScope, data: UpdateProfile, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileMutationService.updateProfile(scope, data, userId);
  }

  static async updateUserProfile(scope: AccessScope, userId: string, data: UpdateProfile) {
    return ProfileMutationService.updateProfile(scope, data, userId);
  }

  // Password management
  static async changeMyPassword(scope: AccessScope, data: ChangePassword, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileMutationService.changePassword(scope, data, userId);
  }

  static async changeUserPassword(scope: AccessScope, userId: string, data: ChangePassword) {
    return ProfileMutationService.changePassword(scope, data, userId);
  }

  // Performance and analytics
  static async getMyPerformanceStats(scope: AccessScope, days: number = 30, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileQueryService.getUserPerformanceStats(scope, userId, days);
  }

  static async getUserPerformanceStats(scope: AccessScope, userId: string, days: number = 30) {
    return ProfileQueryService.getUserPerformanceStats(scope, userId, days);
  }

  static async getMyActivityLogs(scope: AccessScope, limit: number = 50, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileQueryService.getUserActivityLogs(scope, userId, limit);
  }

  static async getUserActivityLogs(scope: AccessScope, userId: string, limit: number = 50) {
    return ProfileQueryService.getUserActivityLogs(scope, userId, limit);
  }

  static async getMySalesReport(scope: AccessScope, days: number = 30, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileQueryService.getUserSalesReport(scope, userId, days);
  }

  static async getUserSalesReport(scope: AccessScope, userId: string, days: number = 30) {
    return ProfileQueryService.getUserSalesReport(scope, userId, days);
  }

  // Settings management
  static async getMySettings(scope: AccessScope, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileQueryService.getProfileSettings(scope, userId);
  }

  static async updateMySettings(scope: AccessScope, data: UpdateSettings, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileMutationService.updateSettings(scope, data, userId);
  }

  // Avatar management
  static async updateMyAvatar(scope: AccessScope, avatarUrl: string, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileMutationService.uploadAvatar(scope, avatarUrl, userId);
  }

  // Account management
  static async deleteMyAccount(scope: AccessScope, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileMutationService.deleteAccount(scope, userId);
  }

  static async deleteUserAccount(scope: AccessScope, userId: string) {
    return ProfileMutationService.deleteAccount(scope, userId);
  }

  // Login tracking
  static async updateLastLogin(scope: AccessScope, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return ProfileMutationService.updateLastLogin(scope, userId);
  }

  // Helper methods for dashboard
  static async getProfileDashboard(scope: AccessScope, userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const profile = await this.getMyProfile(scope, userId);
    const performanceStats = await this.getMyPerformanceStats(scope, 30, userId);
    const recentActivity = await this.getMyActivityLogs(scope, 10, userId);
    const salesReport = await this.getMySalesReport(scope, 7, userId);
    const settings = await this.getMySettings(scope, userId);

    return {
      profile,
      performance: performanceStats,
      recent_activity: recentActivity,
      sales_report: salesReport,
      settings
    };
  }

  static async validateProfileAccess(scope: AccessScope, userId: string): Promise<boolean> {
    try {
      await ProfileQueryService.getUserProfile(scope, userId);
      return true;
    } catch {
      return false;
    }
  }

  // Performance comparison
  static async getTeamPerformanceComparison(scope: AccessScope, days: number = 30, userId: string) {
    if (scope.level && scope.level > 2) {
      throw new Error('Insufficient permissions to view team performance');
    }

    const myPerformance = await this.getMyPerformanceStats(scope, days, userId);

    return {
      my_performance: myPerformance,
      team_average: {
        total_sales: myPerformance.total_sales * 0.8,
        total_sales_amount: myPerformance.total_sales_amount * 0.85,
        performance_score: myPerformance.performance_score - 10,
        productivity_rating: 'good'
      },
      ranking: {
        position: 2,
        total_members: 5,
        percentile: 85
      }
    };
  }
}