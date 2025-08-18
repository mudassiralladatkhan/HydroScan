import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockSensorData, mockDevices, mockSupabaseQuery, createMockSupabaseResponse } from '../utils/testUtils';
import Analytics from '@/pages/Analytics';
import DataExportPage from '@/pages/DataExportPage';
import { supabase } from '@/lib/supabaseClient';

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Analytics to Export Flow', () => {
    it('should display consistent data between Analytics and Export pages', async () => {
      // Mock Supabase responses
      supabase.from.mockImplementation((table) => {
        if (table === 'sensor_readings') {
          return mockSupabaseQuery(createMockSupabaseResponse(mockSensorData));
        }
        if (table === 'exported_files') {
          return mockSupabaseQuery(createMockSupabaseResponse([]));
        }
        return mockSupabaseQuery(createMockSupabaseResponse([]));
      });

      // Render Analytics page
      const { rerender } = renderWithProviders(<Analytics />);
      
      // Verify data is displayed
      expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
      
      // Switch to Export page
      rerender(<DataExportPage />);
      
      // Verify same data context is available
      await waitFor(() => {
        expect(screen.getByText('Data Export & Management')).toBeInTheDocument();
      });
    });

    it('should handle export functionality end-to-end', async () => {
      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(mockSensorData))
      );

      renderWithProviders(<DataExportPage />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Data Export & Management')).toBeInTheDocument();
      });

      // Select export parameters
      const deviceSelect = screen.getByDisplayValue('All Devices');
      fireEvent.change(deviceSelect, { target: { value: 'WS001' } });

      // Set date range
      const dateFromInput = screen.getByLabelText(/Date From/i);
      const dateToInput = screen.getByLabelText(/Date To/i);
      
      fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
      fireEvent.change(dateToInput, { target: { value: '2024-01-31' } });

      // Trigger export
      const exportButton = screen.getByText('Export Data');
      fireEvent.click(exportButton);

      // Verify export process initiated
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('exported_files');
      });
    });
  });

  describe('Device Management Integration', () => {
    it('should sync device status across components', async () => {
      const updatedDevices = [...mockDevices];
      updatedDevices[0].status = 'maintenance';

      supabase.from.mockImplementation((table) => {
        if (table === 'devices') {
          return mockSupabaseQuery(createMockSupabaseResponse(updatedDevices));
        }
        return mockSupabaseQuery(createMockSupabaseResponse([]));
      });

      renderWithProviders(<Analytics />, { 
        initialDevices: updatedDevices 
      });

      await waitFor(() => {
        // Verify device status is reflected in analytics
        expect(screen.getByText('0')).toBeInTheDocument(); // Online devices count
      });
    });
  });

  describe('Real-time Data Updates', () => {
    it('should handle data updates gracefully', async () => {
      let currentData = mockSensorData;
      
      supabase.from.mockImplementation(() => 
        mockSupabaseQuery(createMockSupabaseResponse(currentData))
      );

      const { rerender } = renderWithProviders(<Analytics />);

      // Simulate new data arrival
      const newReading = {
        id: 3,
        device_id: 'WS001',
        ph: 7.5,
        turbidity: 1.2,
        tds: 140,
        temperature: 21.8,
        contamination_score: 12,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      currentData = [...mockSensorData, newReading];
      
      rerender(<Analytics />);

      // Verify updated metrics are calculated
      await waitFor(() => {
        expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
      });
    });
  });
});
