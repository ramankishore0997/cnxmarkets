import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';

export function useAuthState() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem('ecm_token'));

  const { data: user, isLoading, error } = useGetMe({
    ...getAuthOptions(),
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const login = useCallback((newToken: string) => {
    localStorage.setItem('ecm_token', newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecm_token');
    setToken(null);
    queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
    setLocation('/auth/login');
  }, [setLocation, queryClient]);

  // If token is invalid/expired
  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error, logout]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !!token,
    login,
    logout
  };
}
