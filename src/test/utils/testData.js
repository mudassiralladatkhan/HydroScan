// Test data generators and mock utilities
export const mockUser = {
  id: 'test-user-id',
  email: 'test@hydroscan.com',
  role: 'admin',
  organization: {
    id: 'test-org-id',
    name: 'Test Organization'
  }
};

export const mockDevice = {
  id: 'test-device-id',
  name: 'Test Water Station',
  serial_number: 'WS001',
  location: 'Test Location',
  status: 'online',
  organization_id: 'test-org-id',
  is_active: true,
  battery_level: 85,
  last_seen: new Date().toISOString()
};

export const mockSensorReading = {
  id: 'test-reading-id',
  device_id: 'test-device-id',
  timestamp: new Date().toISOString(),
  pH: 7.2,
  turbidity: 1.5,
  tds: 320,
  temperature: 22.5,
  contaminationScore: 25,
  contamination_score: 25
};

export const mockAlert = {
  id: 'test-alert-id',
  device_id: 'test-device-id',
  severity: 'high',
  message: 'pH level out of range',
  triggered_at: new Date().toISOString(),
  resolved: false,
  status: 'active'
};

export const mockAlertRule = {
  id: 'test-rule-id',
  name: 'pH Range Check',
  device_id: 'test-device-id',
  parameter: 'ph',
  condition: 'outside_range',
  threshold_value_1: 6.5,
  threshold_value_2: 8.5,
  severity: 'high',
  is_active: true
};

export const generateSensorData = (count = 10, deviceId = 'test-device-id') => {
  return Array.from({ length: count }, (_, i) => ({
    id: `reading-${i}`,
    device_id: deviceId,
    timestamp: new Date(Date.now() - i * 300000).toISOString(), // 5 min intervals
    ph: 6.5 + Math.random() * 2, // 6.5-8.5
    turbidity: Math.random() * 5, // 0-5 NTU
    tds: 200 + Math.random() * 400, // 200-600 ppm
    temperature: 20 + Math.random() * 10, // 20-30°C
    contamination_score: Math.floor(Math.random() * 100)
  }));
};

export const mockSupabaseResponse = (data = null, error = null) => ({
  data,
  error
});

export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve(mockSupabaseResponse(mockDevice))),
    then: jest.fn(() => Promise.resolve(mockSupabaseResponse([mockDevice])))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve(mockSupabaseResponse({ user: mockUser }))),
    signInWithPassword: jest.fn(() => Promise.resolve(mockSupabaseResponse({ user: mockUser }))),
    signOut: jest.fn(() => Promise.resolve(mockSupabaseResponse()))
  },
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn()
  })),
  removeChannel: jest.fn()
});
