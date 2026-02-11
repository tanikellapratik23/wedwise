import { useEffect, useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';

export const useBudget = () => {
  const { budgets, fetchBudgets, updateBudget, deleteBudget } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchBudgets()
      .then(() => setError(null))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [fetchBudgets]);

  const handleUpdateBudget = useCallback(
    async (id: string, data: any) => {
      setIsLoading(true);
      try {
        await updateBudget(id, data);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Update failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateBudget]
  );

  const handleDeleteBudget = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        await deleteBudget(id);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Delete failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteBudget]
  );

  return {
    budgets,
    isLoading,
    error,
    updateBudget: handleUpdateBudget,
    deleteBudget: handleDeleteBudget,
    refetch: fetchBudgets,
  };
};
