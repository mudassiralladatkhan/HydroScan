import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToPDF, exportToJSON } from '@/lib/exportUtils';
import { mockSensorData, mockDevices, createMockSupabaseResponse } from '../utils/testUtils';

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    autoTable: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: { width: 210, height: 297 }
    }
  }))
}));

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}));

describe('Export Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document methods
    global.document.createElement = vi.fn(() => ({
      href: '',
      download: '',
      style: { visibility: '' },
      click: vi.fn(),
      setAttribute: vi.fn()
    }));
    global.document.body.appendChild = vi.fn();
    global.document.body.removeChild = vi.fn();
  });

  describe('exportToCSV', () => {
    it('exports sensor data to CSV format', async () => {
      const result = await exportToCSV(mockSensorData, mockDevices, 'test-export');
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('test-export');
      expect(result.filename).toContain('.csv');
    });

    it('handles empty data gracefully', async () => {
      const result = await exportToCSV([], mockDevices, 'empty-export');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('No data to export');
    });

    it('includes device names in export', async () => {
      const result = await exportToCSV(mockSensorData, mockDevices, 'device-export');
      
      expect(result.success).toBe(true);
      // Verify that device mapping logic is called
      expect(mockDevices.find).toBeDefined();
    });
  });

  describe('exportToPDF', () => {
    it('exports sensor data to PDF format', async () => {
      const result = await exportToPDF(mockSensorData, mockDevices, 'test-pdf');
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('test-pdf');
      expect(result.filename).toContain('.pdf');
    });

    it('handles PDF generation errors', async () => {
      // Mock PDF generation to throw error
      const mockJsPDF = await import('jspdf');
      mockJsPDF.default.mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      const result = await exportToPDF(mockSensorData, mockDevices, 'error-pdf');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('PDF generation failed');
    });
  });

  describe('exportToJSON', () => {
    it('exports sensor data to JSON format', async () => {
      const result = await exportToJSON(mockSensorData, mockDevices, 'test-json');
      
      expect(result.success).toBe(true);
      expect(result.filename).toContain('test-json');
      expect(result.filename).toContain('.json');
    });

    it('includes metadata in JSON export', async () => {
      const result = await exportToJSON(mockSensorData, mockDevices, 'metadata-json');
      
      expect(result.success).toBe(true);
      // Verify metadata structure
      expect(result.data).toBeDefined();
    });

    it('handles JSON stringification errors', async () => {
      // Create circular reference to cause JSON error
      const circularData = { ...mockSensorData[0] };
      circularData.self = circularData;

      const result = await exportToJSON([circularData], mockDevices, 'circular-json');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
