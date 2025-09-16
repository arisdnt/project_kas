/**
 * Sales Report Controller
 * Handles sales reporting and analytics operations
 */

import { Request, Response } from 'express';
import { PenjualanService } from '../services/PenjualanService';
import { z } from 'zod';

const DateRangeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD'),
  limit: z.string().optional()
});

const DailySalesQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD')
});

export class PenjualanReportController {
  static async getDailySales(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DailySalesQuerySchema.parse(req.query);
      const report = await PenjualanService.getDailySales(req.accessScope, query.date);

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get daily sales error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get daily sales report'
      });
    }
  }

  static async getTopProducts(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DateRangeQuerySchema.parse(req.query);
      const limit = query.limit ? Number(query.limit) : undefined;

      const report = await PenjualanService.getTopProducts(
        req.accessScope,
        query.start_date,
        query.end_date,
        limit
      );

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get top products error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get top products report'
      });
    }
  }

  static async getSalesChart(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DateRangeQuerySchema.parse(req.query);
      const report = await PenjualanService.getSalesChart(
        req.accessScope,
        query.start_date,
        query.end_date
      );

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get sales chart error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get sales chart data'
      });
    }
  }

  static async getPaymentMethodStats(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DateRangeQuerySchema.parse(req.query);
      const report = await PenjualanService.getPaymentMethodStats(
        req.accessScope,
        query.start_date,
        query.end_date
      );

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get payment method stats error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get payment method statistics'
      });
    }
  }

  static async getCashierPerformance(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const query = DateRangeQuerySchema.parse(req.query);
      const report = await PenjualanService.getCashierPerformance(
        req.accessScope,
        query.start_date,
        query.end_date
      );

      return res.json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get cashier performance error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to get cashier performance report'
      });
    }
  }
}