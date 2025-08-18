import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SensorChart from '@/components/SensorChart';
import { mockSensorData } from '../utils/testUtils';

describe('SensorChart Component', () => {
  it('renders chart container', () => {
    render(<SensorChart data={mockSensorData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders line chart when data is provided', () => {
    render(<SensorChart data={mockSensorData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(<SensorChart data={[]} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('handles null data gracefully', () => {
    render(<SensorChart data={null} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('renders chart elements', () => {
    render(<SensorChart data={mockSensorData} />);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
  });
});
