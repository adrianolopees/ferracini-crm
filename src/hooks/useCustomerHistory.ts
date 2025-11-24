import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from '@/utils';
import { findCompletedCustomers, findArchivedCustomers, getAllCustomers } from '@/repositories';

interface HistoryData {
  lists: {
    finalized: Customer[];
    transfer: Customer[];
    archived: Customer[];
    longWait: Customer[];
  };
  loading: boolean;
  refresh: () => void;
}

function useHistoryData(): HistoryData {
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lists, setLists] = useState<HistoryData['lists']>({
    finalized: [],
    transfer: [],
    archived: [],
    longWait: [],
  });

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchHistoryData() {
      setLoading(true);
      try {
        const [finalized, archived, allCustomers] = await Promise.all([
          findCompletedCustomers(),
          findArchivedCustomers(),
          getAllCustomers(),
        ]);

        const transfer = allCustomers.filter(
          (customer) => customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro'
        );

        const LONG_WAIT_DAYS = 30;
        const longWait = allCustomers.filter((customer) => {
          if (customer.archived || customer.status === 'completed') {
            return false;
          }
          const daysWaiting = getDaysWaiting(customer.createdAt);
          return daysWaiting >= LONG_WAIT_DAYS;
        });

        const sortByDaysWaiting = (a: Customer, b: Customer) =>
          getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt);

        setLists({
          finalized: finalized.sort(sortByDaysWaiting),
          transfer: transfer.sort(sortByDaysWaiting),
          archived: archived.sort(sortByDaysWaiting),
          longWait: longWait.sort(sortByDaysWaiting),
        });
      } catch (error) {
        console.error('Erro ao buscar dados do histórico:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoryData();
  }, [refreshTrigger]);

  return {
    lists,
    loading,
    refresh,
  };
}

export default useHistoryData;
