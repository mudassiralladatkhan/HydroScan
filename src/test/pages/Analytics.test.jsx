import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Analytics from '@/pages/Analytics';
import { renderWithProviders, mockSensorData, mockDevices } from '../utils/testUtils';

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders analytics page title', () => {
    renderWithProviders(<Analytics />);
    expect(screen.getByText('Analytics & Insights')).toBeInTheDocument();
  });

  it('displays key metrics cards when data exists', () => {
    renderWithProviders(<Analytics />);
    expect(screen.getByText('Avg pH Level')).toBeInTheDocument();
    expect(screen.getByText('Avg Temperature')).toBeInTheDocument();
    expect(screen.getByText('Avg TDS Level')).toBeInTheDocument();
    expect(screen.getByText('Contamination Risk')).toBeInTheDocument();
  });

  it('calculates metrics from sensor data', () => {
    renderWithProviders(<Analytics />);
    
    // Check if metrics are calculated and displayed
    expect(screen.getByText('7.20')).toBeInTheDocument(); // Average pH
    expect(screen.getByText('22.5°C')).toBeInTheDocument(); // Average temp
  });

  it('opens export dialog when export button clicked', async () => {
    renderWithProviders(<Analytics />);
    
    const exportButton = screen.getByText('Export Report');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText('Export Analytics Report (Mock)')).toBeInTheDocument();
    });
  });

  it('opens time filter dialog when time filter button clicked', async () => {
    renderWithProviders(<Analytics />);
    
    const timeFilterButton = screen.getByText('Last 24h');
    fireEvent.click(timeFilterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Select Time Range (Mock)')).toBeInTheDocument();
    });
  });

  it('renders tabs correctly', () => {
    renderWithProviders(<Analytics />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Contamination')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('hides metrics when sensor data is empty', () => {
    renderWithProviders(<Analytics />, { 
      initialSensorData: [],
      initialDevices: mockDevices 
    });
    
    // When no data, metrics cards should not be rendered
    expect(screen.queryByText('Avg pH Level')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg Temperature')).not.toBeInTheDocument();
  });
});
