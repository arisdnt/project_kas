/**
 * Scope Controller
 * Handles tenant and store scope operations for dropdown selections
 */

import { Request, Response } from 'express';
import { ScopeService } from '../services/ScopeService';

export class ScopeController {
  /**
   * @swagger
   * /api/scope/tenants:
   *   get:
   *     tags: [Scope]
   *     summary: Get accessible tenants for current user
   *     description: Returns list of tenants user can access for scope selection
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of accessible tenants
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       nama:
   *                         type: string
   *                       status:
   *                         type: string
   *                       canApplyToAll:
   *                         type: boolean
   */
  static async getAccessibleTenants(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const tenants = await ScopeService.getAccessibleTenants(req.accessScope);

      return res.json({
        success: true,
        data: tenants
      });
    } catch (error: any) {
      console.error('Get accessible tenants error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get accessible tenants'
      });
    }
  }

  /**
   * @swagger
   * /api/scope/stores:
   *   get:
   *     tags: [Scope]
   *     summary: Get accessible stores for current user
   *     description: Returns list of stores user can access for scope selection
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter stores by tenant ID
   *     responses:
   *       200:
   *         description: List of accessible stores
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       nama:
   *                         type: string
   *                       tenant_id:
   *                         type: string
   *                         format: uuid
   *                       status:
   *                         type: string
   *                       canApplyToAll:
   *                         type: boolean
   */
  static async getAccessibleStores(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { tenantId } = req.query;
      const stores = await ScopeService.getAccessibleStores(req.accessScope, tenantId as string);

      return res.json({
        success: true,
        data: stores
      });
    } catch (error: any) {
      console.error('Get accessible stores error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get accessible stores'
      });
    }
  }

  /**
   * @swagger
   * /api/scope/capabilities:
   *   get:
   *     tags: [Scope]
   *     summary: Get user scope capabilities
   *     description: Returns user's capabilities for scope operations
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User scope capabilities
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     canSelectTenant:
   *                       type: boolean
   *                     canSelectStore:
   *                       type: boolean
   *                     canApplyToAllTenants:
   *                       type: boolean
   *                     canApplyToAllStores:
   *                       type: boolean
   *                     level:
   *                       type: integer
   *                     isGod:
   *                       type: boolean
   */
  static async getScopeCapabilities(req: Request, res: Response) {
    try {
      if (!req.user || !req.accessScope) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const capabilities = ScopeService.getUserCapabilities(req.accessScope);

      return res.json({
        success: true,
        data: capabilities
      });
    } catch (error: any) {
      console.error('Get scope capabilities error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get scope capabilities'
      });
    }
  }
}