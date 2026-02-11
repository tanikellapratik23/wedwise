import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';

export const useExpenses = () => {
  const { expenses, fetchExpenses, addExpense, settleExpense } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchExpenses = useCallback(
    async (budgetId: string) => {
      setIsLoading(true);
      try {
        await fetchExpenses(budgetId);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fetch failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchExpenses]
  );

  const handleAddExpense = useCallback(
    async (budgetId: string, expense: any) => {
      setIsLoading(true);
      try {
        await addExpense(budgetId, expense);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Add failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addExpense]
  );

  const handleSettleExpense = useCallback(
    async (expenseId: string) => {
      setIsLoading(true);
      try {
        await settleExpense(expenseId);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Settle failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [settleExpense]
  );

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses: handleFetchExpenses,
    addExpense: handleAddExpense,
    settleExpense: handleSettleExpense,
  };
};
