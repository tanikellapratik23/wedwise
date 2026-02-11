import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsLoggingIn(true);
      setError(null);
      try {
        await login(email, password);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Login failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [login]
  );

  const handleLogout = useCallback(() => {
    logout();
    setError(null);
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    error,
    login: handleLogin,
    logout: handleLogout,
  };
};
