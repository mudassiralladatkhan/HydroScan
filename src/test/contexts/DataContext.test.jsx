import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DataProvider, useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockUser, mockDevice, mockSensorReading, mockAlert } from '../utils/testData';

vi.mock('@/contexts/AuthContext');
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: mockDevice, error: null })),
      then: vi.fn(() => Promise.resolve({ data: [mockDevice], error: null }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

describe('DataContext', () => {
  const wrapper = ({ children }) => (
    <DataProvider>{children}</DataProvider>
  );

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
      loading: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('provides data context values', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.devices).toBeDefined();
    expect(result.current.sensorData).toBeDefined();
    expect(result.current.alerts).toBeDefined();
    expect(result.current.addDevice).toBeTypeOf('function');
    expect(result.current.updateDevice).toBeTypeOf('function');
    expect(result.current.deleteDevice).toBeTypeOf('function');
  });

  test('adds device successfully', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    await act(async () => {
      const newDevice = await result.current.addDevice({
        name: 'New Device',
        serial_number: 'WS003',
        location: 'New Location'
      });
      expect(newDevice).toBeDefined();
    });
  });

  test('updates device successfully', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    await act(async () => {
      const updatedDevice = await result.current.updateDevice('device-id', {
        name: 'Updated Device'
      });
      expect(updatedDevice).toBeDefined();
    });
  });

  test('deletes device successfully', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    await act(async () => {
      const success = await result.current.deleteDevice('device-id');
      expect(success).toBe(true);
    });
  });

  test('resolves alert successfully', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    await act(async () => {
      const resolvedAlert = await result.current.resolveAlert('alert-id');
      expect(resolvedAlert).toBeDefined();
    });
  });

  test('handles loading state', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    });

    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.loadingData).toBe(false);
  });
});
