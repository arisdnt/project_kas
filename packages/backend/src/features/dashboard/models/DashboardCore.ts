/**
 * Dashboard Core Model
 * Model for dashboard widgets and analytics data
 */

import { z } from 'zod';

export const DashboardQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, use YYYY-MM-DD').optional(),
  toko_id: z.string().uuid().optional(),
  period: z.enum(['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'custom']).default('today')
});

export const KPICardSchema = z.object({
  title: z.string(),
  value: z.number(),
  change: z.number().optional(),
  change_type: z.enum(['increase', 'decrease', 'neutral']).optional(),
  format: z.enum(['currency', 'number', 'percentage']).default('number'),
  icon: z.string().optional(),
  color: z.string().optional()
});

export const ChartDataSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
  meta: z.record(z.any()).optional()
});

export const TimeSeriesDataSchema = z.object({
  date: z.string(),
  value: z.number(),
  label: z.string().optional()
});

export const DashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['kpi', 'chart', 'table', 'list']),
  title: z.string(),
  data: z.any(),
  config: z.record(z.any()).optional(),
  refresh_interval: z.number().optional(),
  last_updated: z.date().optional()
});

export const AnalyticsFilterSchema = z.object({
  tenant_id: z.string().uuid(),
  toko_id: z.string().uuid().optional(),
  start_date: z.string(),
  end_date: z.string(),
  group_by: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
  compare_with_previous: z.boolean().optional().default(false)
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type KPICard = z.infer<typeof KPICardSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;
export type TimeSeriesData = z.infer<typeof TimeSeriesDataSchema>;
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;