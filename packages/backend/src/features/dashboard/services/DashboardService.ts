/**
 * Dashboard Service Orchestrator
 * Main service that coordinates dashboard data operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { AnalyticsFilter } from '../models/DashboardCore';
import { DashboardAnalyticsService } from './modules/DashboardAnalyticsService';

export class DashboardService {
  static async getOverviewKPIs(scope: AccessScope, startDate: string, endDate: string) {
    return DashboardAnalyticsService.getOverviewKPIs(scope, startDate, endDate);
  }

  static async getSalesChart(scope: AccessScope, filter: AnalyticsFilter) {
    return DashboardAnalyticsService.getSalesChart(scope, filter);
  }

  static async getTopProducts(scope: AccessScope, startDate: string, endDate: string, limit: number = 10) {
    return DashboardAnalyticsService.getTopProducts(scope, startDate, endDate, limit);
  }

  static async getTopCustomers(scope: AccessScope, startDate: string, endDate: string, limit: number = 10) {
    return DashboardAnalyticsService.getTopCustomers(scope, startDate, endDate, limit);
  }

  static async getPaymentMethodDistribution(scope: AccessScope, startDate: string, endDate: string) {
    return DashboardAnalyticsService.getPaymentMethodDistribution(scope, startDate, endDate);
  }

  static async getCategoryPerformance(scope: AccessScope, startDate: string, endDate: string) {
    return DashboardAnalyticsService.getCategoryPerformance(scope, startDate, endDate);
  }
}