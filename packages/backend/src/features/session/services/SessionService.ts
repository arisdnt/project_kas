/**
 * Session Service Orchestrator
 * Main service that coordinates session operations
 */

import { AccessScope } from '@/core/middleware/accessScope';
import { SearchSessionQuery, CreateSession, UpdateSession } from '../models/SessionCore';
import { SessionQueryService } from './modules/SessionQueryService';
import { SessionMutationService } from './modules/SessionMutationService';

export class SessionService {
  // Query operations
  static async search(scope: AccessScope, query: SearchSessionQuery) {
    return SessionQueryService.search(scope, query);
  }

  static async findActiveSessionsByUser(userId: string) {
    return SessionQueryService.findActiveSessionsByUser(userId);
  }

  static async findSessionByToken(token: string) {
    return SessionQueryService.findSessionByToken(token);
  }

  static async getSessionStats(scope: AccessScope) {
    return SessionQueryService.getSessionStats(scope);
  }

  // Mutation operations
  static async createSession(data: CreateSession) {
    // Validate session data
    if (data.expires_at <= new Date()) {
      throw new Error('Session expiry time must be in the future');
    }

    return SessionMutationService.createSession(data);
  }

  static async updateSession(sessionToken: string, data: UpdateSession) {
    return SessionMutationService.updateSession(sessionToken, data);
  }

  static async deactivateSession(sessionToken: string) {
    return SessionMutationService.deactivateSession(sessionToken);
  }

  static async deactivateAllUserSessions(userId: string, exceptToken?: string) {
    return SessionMutationService.deactivateAllUserSessions(userId, exceptToken);
  }

  static async refreshSession(refreshToken: string, expiryHours: number = 24) {
    const newExpiryTime = new Date();
    newExpiryTime.setHours(newExpiryTime.getHours() + expiryHours);

    return SessionMutationService.refreshSession(refreshToken, newExpiryTime);
  }

  static async cleanupExpiredSessions() {
    return SessionMutationService.cleanupExpiredSessions();
  }

  // Security operations
  static async logoutAllDevices(userId: string) {
    return SessionMutationService.deactivateAllUserSessions(userId);
  }

  static async logoutOtherDevices(userId: string, currentToken: string) {
    return SessionMutationService.deactivateAllUserSessions(userId, currentToken);
  }

  static async isSessionValid(sessionToken: string): Promise<boolean> {
    const session = await SessionQueryService.findSessionByToken(sessionToken);
    return session !== null;
  }

  static async extendSession(sessionToken: string, additionalHours: number = 1) {
    const newExpiryTime = new Date();
    newExpiryTime.setHours(newExpiryTime.getHours() + additionalHours);

    return SessionMutationService.updateSession(sessionToken, {
      expires_at: newExpiryTime
    });
  }
}