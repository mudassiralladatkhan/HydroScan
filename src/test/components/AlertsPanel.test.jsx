import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AlertsPanel from '@/components/AlertsPanel';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockAlert, mockUser } from '../utils/testData';

vi.mock('@/contexts/DataContext');
vi.mock('@/contexts/AuthContext');

describe('AlertsPanel Component', () => {
  const mockResolveAlert = vi.fn();
  const mockAcknowledgeAlert = vi.fn();

  const mockUseData = {
    resolveAlert: mockResolveAlert,
    acknowledgeAlert: mockAcknowledgeAlert
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

  test('renders alerts panel with alerts', () => {
    const alerts = [mockAlert];
    render(<AlertsPanel alerts={alerts} />);
    
    expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
    expect(screen.getByText('pH level out of range')).toBeInTheDocument();
  });

  test('displays empty state when no alerts', () => {
    render(<AlertsPanel alerts={[]} />);
    expect(screen.getByText('No active alerts')).toBeInTheDocument();
  });

  test('handles alert resolution', async () => {
    const alerts = [mockAlert];
    render(<AlertsPanel alerts={alerts} />);
    
    const resolveButton = screen.getByLabelText('Resolve alert');
    fireEvent.click(resolveButton);
    
    expect(mockResolveAlert).toHaveBeenCalledWith('test-alert-id');
  });

  test('handles alert acknowledgment', async () => {
    const alerts = [mockAlert];
    render(<AlertsPanel alerts={alerts} />);
    
    const ackButton = screen.getByLabelText('Acknowledge alert');
    fireEvent.click(ackButton);
    
    expect(mockAcknowledgeAlert).toHaveBeenCalledWith('test-alert-id');
  });

  test('shows correct severity styling', () => {
    const highAlert = { ...mockAlert, severity: 'high' };
    const mediumAlert = { ...mockAlert, id: 'alert-2', severity: 'medium' };
    
    render(<AlertsPanel alerts={[highAlert, mediumAlert]} />);
    
    const highSeverityElement = screen.getByText('high');
    const mediumSeverityElement = screen.getByText('medium');
    
    expect(highSeverityElement).toHaveClass('bg-red-500');
    expect(mediumSeverityElement).toHaveClass('bg-yellow-500');
  });
});
