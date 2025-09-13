import { useState, useEffect } from 'react';
import { Promo, CreatePromoRequest, UpdatePromoRequest, PromoStats } from '../types/promo';
import { promoService } from '../services/promoService';

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all promos
  const loadPromos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await promoService.getPromos();
      setPromos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promos');
    } finally {
      setLoading(false);
    }
  };

  // Load promo stats
  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await promoService.getPromoStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo stats');
    } finally {
      setLoading(false);
    }
  };

  // Create new promo
  const createPromo = async (promo: CreatePromoRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPromo = await promoService.createPromo(promo);
      setPromos(prev => [...prev, newPromo]);
      return newPromo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create promo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update promo
  const updatePromo = async (id: number, promo: UpdatePromoRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPromo = await promoService.updatePromo(id, promo);
      setPromos(prev => prev.map(p => p.id === id ? updatedPromo : p));
      return updatedPromo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update promo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete promo
  const deletePromo = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await promoService.deletePromo(id);
      setPromos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle promo status
  const togglePromoStatus = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPromo = await promoService.togglePromoStatus(id);
      setPromos(prev => prev.map(p => p.id === id ? updatedPromo : p));
      return updatedPromo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle promo status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPromos();
    loadStats();
  }, []);

  return {
    promos,
    stats,
    loading,
    error,
    loadPromos,
    loadStats,
    createPromo,
    updatePromo,
    deletePromo,
    togglePromoStatus,
  };
}

export function useActivePromos() {
  const [activePromos, setActivePromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivePromos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await promoService.getActivePromos();
      setActivePromos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active promos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivePromos();
  }, []);

  return {
    activePromos,
    loading,
    error,
    loadActivePromos,
  };
}