
import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { DashboardAnalyticsService } from '../services/modules/DashboardAnalyticsService';
import { DashboardQuerySchema, AnalyticsFilterSchema } from '../models/DashboardCore';
import { AccessScope } from '@/core/middleware/accessScope';
import { logger } from '@/core/utils/logger';
import { z } from 'zod';

// Schema untuk query parameters yang sering digunakan
const TopItemsQuerySchema = DashboardQuerySchema.extend({
  limit: z.string().optional().default('10')
});

const OverviewKPIQuerySchema = DashboardQuerySchema;
const SalesChartQuerySchema = AnalyticsFilterSchema;
const TopProductsQuerySchema = TopItemsQuerySchema;
const TopCustomersQuerySchema = TopItemsQuerySchema;
const PaymentMethodQuerySchema = DashboardQuerySchema;
const CategoryPerformanceQuerySchema = DashboardQuerySchema;

export class DashboardController {
  static async getOverviewKPIs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DashboardQuerySchema.parse(req.query);
      const kpis = await DashboardService.getOverviewKPIs(
        req.accessScope,
        query.start_date || '',
        query.end_date || ''
      );

      return res.json({ success: true, data: kpis });
    } catch (error: any) {
      console.error('Get overview KPIs error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get overview KPIs'
      });
    }
  }

  static async getSalesChart(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = AnalyticsFilterSchema.parse(req.query);
      const chartData = await DashboardService.getSalesChart(
        req.accessScope,
        query
      );

      return res.json({ success: true, data: chartData });
    } catch (error: any) {
      console.error('Get sales chart error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get sales chart'
      });
    }
  }

  static async getTopProducts(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = TopItemsQuerySchema.parse(req.query);
      const products = await DashboardService.getTopProducts(
        req.accessScope,
        query.start_date || '',
        query.end_date || '',
        Number(query.limit)
      );

      return res.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Get top products error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get top products'
      });
    }
  }

  static async getTopCustomers(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = TopItemsQuerySchema.parse(req.query);
      const customers = await DashboardService.getTopCustomers(
        req.accessScope,
        query.start_date || '',
        query.end_date || '',
        Number(query.limit)
      );

      return res.json({ success: true, data: customers });
    } catch (error: any) {
      console.error('Get top customers error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get top customers'
      });
    }
  }

  static async getPaymentMethodDistribution(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DashboardQuerySchema.parse(req.query);
      const distribution = await DashboardService.getPaymentMethodDistribution(
        req.accessScope,
        query.start_date || '',
        query.end_date || ''
      );

      return res.json({ success: true, data: distribution });
    } catch (error: any) {
      console.error('Get payment method distribution error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get payment method distribution'
      });
    }
  }

  static async getCategoryPerformance(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DashboardQuerySchema.parse(req.query);
      const performance = await DashboardService.getCategoryPerformance(
        req.accessScope,
        query.start_date || '',
        query.end_date || ''
      );

      return res.json({ success: true, data: performance });
    } catch (error: any) {
      console.error('Get category performance error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get category performance'
      });
    }
  }
}