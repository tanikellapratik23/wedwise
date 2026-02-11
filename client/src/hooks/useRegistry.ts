import { useEffect, useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';

export const useRegistry = () => {
  const { registries, fetchRegistries, updateRegistry } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchRegistries()
      .then(() => setError(null))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [fetchRegistries]);

  const handleUpdateRegistry = useCallback(
    async (id: string, data: any) => {
      setIsLoading(true);
      try {
        await updateRegistry(id, data);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Update failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateRegistry]
  );

  return {
    registries,
    isLoading,
    error,
    updateRegistry: handleUpdateRegistry,
    refetch: fetchRegistries,
  };
};
