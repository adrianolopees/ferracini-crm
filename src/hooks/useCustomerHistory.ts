import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from '@/utils';
import { findCompletedCustomers, findArchivedCustomers, getAllCustomers } from '@/repositories';

interface CustomerHistory {
  lists: {
    finalized: Customer[];
    transfer: Customer[];
    archived: Customer[];
    longWait: Customer[];
  };
  loading: boolean;
  refresh: () => void;
}

function useCustomerHistory(): CustomerHistory {
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lists, setLists] = useState<CustomerHistory['lists']>({
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
        const [completed, archived, allCustomers] = await Promise.all([
          findCompletedCustomers(),
          findArchivedCustomers(),
          getAllCustomers(),
        ]);

        const LONG_WAIT_DAYS = 30;

        const processed = allCustomers.reduce<CustomerHistory['lists']>(
          (acc, customer) => {
            if (customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro') {
              acc.transfer.push(customer);
            }

            if (!customer.archived && customer.status !== 'completed') {
              const daysWaiting = getDaysWaiting(customer.createdAt);
              if (daysWaiting >= LONG_WAIT_DAYS) {
                acc.longWait.push(customer);
              }
            }
            return acc;
          },
          {
            finalized: completed,
            transfer: [],
            archived: archived,
            longWait: [],
          }
        );

        const sortByDaysWaiting = (a: Customer, b: Customer) =>
          getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt);

        Object.values(processed).forEach((list) => list.sort(sortByDaysWaiting));
        setLists(processed);
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

export default useCustomerHistory;
