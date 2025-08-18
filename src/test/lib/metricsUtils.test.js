import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSystemPerformanceMetrics, getApiUsageAnalytics, getDataQualityScore } from '@/lib/metricsUtils';
import { supabase } from '@/lib/supabaseClient';
import { createMockSupabaseResponse, mockSupabaseQuery } from '../utils/testUtils';

describe('Metrics Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemPerformanceMetrics', () => {
    it('calculates performance metrics from real data', async () => {
      const mockReadings = [
        { id: 1, timestamp: new Date().toISOString() },
        { id: 2, timestamp: new Date().toISOString() }
      ];
      
      const mockApiLogs = [
        { response_time: 100, status_code: 200 },
        { response_time: 150, status_code: 404 }
      ];

      supabase.from.mockImplementation((table) => {
        if (table === 'sensor_readings') {
          return mockSupabaseQuery(createMockSupabaseResponse(mockReadings));
        }
        if (table === 'api_logs') {
          return mockSupabaseQuery(createMockSupabaseResponse(mockApiLogs));
        }
        return mockSupabaseQuery(createMockSupabaseResponse([]));
      });

      const metrics = await getSystemPerformanceMetrics();

      expect(metrics).toHaveProperty('ingestionRate');
      expect(metrics).toHaveProperty('queryLatency');
      expect(metrics).toHaveProperty('storageUsed');
      expect(metrics).toHaveProperty('apiResponseTime');
      expect(metrics).toHaveProperty('dataProcessingErrors');
      expect(metrics.ingestionRate).toBeGreaterThanOrEqual(0);
    });

    it('returns fallback values on error', async () => {
      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(null, new Error('Database error')))
      );

      const metrics = await getSystemPerformanceMetrics();

      expect(metrics.ingestionRate).toBe(15);
      expect(metrics.queryLatency).toBe(75);
      expect(metrics.storageUsed).toBe(2.3);
    });
  });

  describe('getApiUsageAnalytics', () => {
    it('generates analytics for specified number of days', async () => {
      const mockLogs = [
        { created_at: new Date().toISOString(), status_code: 200 },
        { created_at: new Date().toISOString(), status_code: 404 }
      ];

      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(mockLogs))
      );

      const analytics = await getApiUsageAnalytics(7);

      expect(analytics).toHaveLength(7);
      expect(analytics[0]).toHaveProperty('name');
      expect(analytics[0]).toHaveProperty('calls');
      expect(analytics[0]).toHaveProperty('errors');
    });

    it('returns fallback data on error', async () => {
      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(null, new Error('API error')))
      );

      const analytics = await getApiUsageAnalytics(5);

      expect(analytics).toHaveLength(5);
      expect(analytics[0].calls).toBeGreaterThan(0);
    });
  });

  describe('getDataQualityScore', () => {
    it('calculates quality score based on data completeness', async () => {
      const mockReadings = [
        { ph: 7.0, turbidity: 1.5, tds: 150, temperature: 22.0 },
        { ph: 6.8, turbidity: null, tds: 180, temperature: 23.0 }
      ];

      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(mockReadings))
      );

      const score = await getDataQualityScore();

      expect(score).toBeGreaterThanOrEqual(60);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns fallback score on error', async () => {
      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(null, new Error('Quality error')))
      );

      const score = await getDataQualityScore();

      expect(score).toBe(87);
    });

    it('handles empty data gracefully', async () => {
      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse([]))
      );

      const score = await getDataQualityScore();

      expect(score).toBe(85);
    });
  });
});
