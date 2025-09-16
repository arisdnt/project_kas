/**
 * Dashboard Controller
 * Handles dashboard data requests with access scope validation
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { DashboardQuerySchema, AnalyticsFilterSchema } from '../models/DashboardCore';
import { z } from 'zod';

const OverviewKPIQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD')
});

const TopItemsQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  limit: z.string().optional().default('10')
});

export class DashboardController {
  static async getOverviewKPIs(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = OverviewKPIQuerySchema.parse(req.query);
      const kpis = await DashboardService.getOverviewKPIs(
        req.accessScope,
        query.start_date,
        query.end_date
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

      const filter = AnalyticsFilterSchema.parse({
        ...req.query,
        tenant_id: req.accessScope.tenantId
      });

      const chartData = await DashboardService.getSalesChart(req.accessScope, filter);
      return res.json({ success: true, data: chartData });
    } catch (error: any) {
      console.error('Get sales chart error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get sales chart data'
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
        query.start_date,
        query.end_date,
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
        query.start_date,
        query.end_date,
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

      const query = OverviewKPIQuerySchema.parse(req.query);
      const distribution = await DashboardService.getPaymentMethodDistribution(
        req.accessScope,
        query.start_date,
        query.end_date
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

      const query = OverviewKPIQuerySchema.parse(req.query);
      const performance = await DashboardService.getCategoryPerformance(
        req.accessScope,
        query.start_date,
        query.end_date
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