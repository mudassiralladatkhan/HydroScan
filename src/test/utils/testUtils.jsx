import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DataProvider } from '@/contexts/DataContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorProvider } from '@/contexts/ErrorContext';

// Mock data for testing
export const mockSensorData = [
  {
    id: 1,
    device_id: 'WS001',
    ph: 7.2,
    turbidity: 1.5,
    tds: 150,
    temperature: 22.5,
    contamination_score: 15,
    timestamp: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    device_id: 'WS002',
    ph: 6.8,
    turbidity: 2.1,
    tds: 180,
    temperature: 23.1,
    contamination_score: 25,
    timestamp: '2024-01-15T11:00:00Z',
    created_at: '2024-01-15T11:00:00Z'
  }
];

export const mockDevices = [
  {
    id: 'WS001',
    name: 'Water Station 001',
    location: 'North District',
    status: 'online',
    last_reading: '2024-01-15T10:00:00Z',
    battery_level: 85,
    signal_strength: 92
  },
  {
    id: 'WS002',
    name: 'Water Station 002',
    location: 'South District',
    status: 'offline',
    last_reading: '2024-01-14T15:30:00Z',
    battery_level: 45,
    signal_strength: 78
  }
];

export const mockUser = {
  id: 'user-123',
  email: 'test@hydroscan.com',
  user_metadata: {
    full_name: 'Test User',
    role: 'admin'
  }
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialSensorData = mockSensorData,
    initialDevices = mockDevices,
    initialUser = mockUser,
    ...renderOptions
  } = options;

  const AllTheProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <ErrorProvider>
          <AuthProvider initialUser={initialUser}>
            <DataProvider 
              initialSensorData={initialSensorData}
              initialDevices={initialDevices}
            >
              {children}
            </DataProvider>
          </AuthProvider>
        </ErrorProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Helper functions for testing
export const createMockSupabaseResponse = (data = [], error = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
});

export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    expect(document.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
  });
};

export const mockSupabaseQuery = (returnValue) => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(returnValue),
    then: vi.fn().mockResolvedValue(returnValue)
  };
  
  return mockChain;
};
