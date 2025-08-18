import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DeviceManagement from '@/pages/DeviceManagement';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockUser, mockDevice } from '../utils/testData';

vi.mock('@/contexts/DataContext');
vi.mock('@/contexts/AuthContext');

describe('DeviceManagement Component', () => {
  const mockAddDevice = vi.fn();
  const mockUpdateDevice = vi.fn();
  const mockDeleteDevice = vi.fn();

  const mockUseData = {
    devices: [mockDevice],
    addDevice: mockAddDevice,
    updateDevice: mockUpdateDevice,
    deleteDevice: mockDeleteDevice,
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

  test('renders device management page', () => {
    render(<DeviceManagement />);
    expect(screen.getByText('Device Management')).toBeInTheDocument();
  });

  test('displays device list', () => {
    render(<DeviceManagement />);
    expect(screen.getByText('Test Water Station')).toBeInTheDocument();
    expect(screen.getByText('WS001')).toBeInTheDocument();
  });

  test('opens add device dialog', async () => {
    render(<DeviceManagement />);
    
    const addButton = screen.getByText('Add Device');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Device')).toBeInTheDocument();
    });
  });

  test('handles device deletion', async () => {
    mockDeleteDevice.mockResolvedValue(true);
    
    render(<DeviceManagement />);
    
    const deleteButton = screen.getByLabelText('Delete device');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockDeleteDevice).toHaveBeenCalledWith('test-device-id');
    });
  });

  test('shows device status correctly', () => {
    render(<DeviceManagement />);
    expect(screen.getByText('online')).toBeInTheDocument();
  });
});
