import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { mockUser } from '../utils/testData';

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: mockUser, error: null }))
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: mockUser } }, 
        error: null 
      })),
      onAuthStateChange: vi.fn(() => ({
        subscription: { unsubscribe: vi.fn() }
      })),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(() => Promise.resolve({ error: null }))
    }
  }
}));

describe('AuthContext', () => {
  const wrapper = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('provides auth context values', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.signIn).toBeTypeOf('function');
      expect(result.current.signOut).toBeTypeOf('function');
    });
  });

  test('updates user preferences', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateUserPreferences({
        theme: 'light',
        notifications: { email: true }
      });
    });

    expect(result.current.preferences).toBeDefined();
  });

  test('handles sign out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });
  });
});
