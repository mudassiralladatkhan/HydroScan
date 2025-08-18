import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from '@/pages/Dashboard';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockUser, mockDevice, mockSensorReading, mockAlert } from '../utils/testData';

// Mock the contexts
vi.mock('@/contexts/DataContext');
vi.mock('@/contexts/AuthContext');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('Dashboard Component', () => {
  const mockUseData = {
    devices: [mockDevice],
    sensorData: [mockSensorReading],
    alerts: [mockAlert],
    loadingData: false
  };

  const mockUseAuth = {
    user: mockUser,
    preferences: { theme: 'dark' }
  };

  beforeEach(() => {
    useData.mockReturnValue(mockUseData);
    useAuth.mockReturnValue(mockUseAuth);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders dashboard with welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText("Welcome to T_P_P 's")).toBeInTheDocument();
    expect(screen.getByText('Real-time water quality monitoring overview')).toBeInTheDocument();
  });

  test('displays key metrics cards', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Active Devices')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('Avg Water Quality')).toBeInTheDocument();
    expect(screen.getByText('Data Points Today')).toBeInTheDocument();
  });

  test('shows correct device status', () => {
    render(<Dashboard />);
    expect(screen.getByText('1/1')).toBeInTheDocument(); // 1 online out of 1 total
    expect(screen.getByText('100% online')).toBeInTheDocument();
  });

  test('displays active alerts count', () => {
    render(<Dashboard />);
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 active alert
  });

  test('opens customize dashboard dialog', async () => {
    render(<Dashboard />);
    
    const customizeButton = screen.getByText('Customize Dashboard');
    fireEvent.click(customizeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Toggle visibility of dashboard sections.')).toBeInTheDocument();
    });
  });

  test('renders sensor chart section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Real-time Sensor Data')).toBeInTheDocument();
    expect(screen.getByText('Live monitoring of key water quality parameters')).toBeInTheDocument();
  });

  test('shows device status overview', () => {
    render(<Dashboard />);
    expect(screen.getByText('Device Status Overview')).toBeInTheDocument();
    expect(screen.getByText('Test Water Station')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  test('displays admin overview for admin users', () => {
    render(<Dashboard />);
    expect(screen.getByText('Admin Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    useData.mockReturnValue({
      devices: [],
      sensorData: [],
      alerts: [],
      loadingData: false
    });

    render(<Dashboard />);
    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByText('0% online')).toBeInTheDocument();
  });

  test('applies correct theme classes', () => {
    render(<Dashboard />);
    const container = screen.getByText("Welcome to T_P_P 's").closest('div');
    expect(container).toHaveClass('text-white');
  });

  test('calculates water quality correctly', () => {
    const mockDataWithScores = {
      ...mockUseData,
      sensorData: [
        { ...mockSensorReading, contamination_score: 20 },
        { ...mockSensorReading, contamination_score: 30 }
      ]
    };
    useData.mockReturnValue(mockDataWithScores);

    render(<Dashboard />);
    // Average contamination: 25, so water quality should be 75%
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });
});
