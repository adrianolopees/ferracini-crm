import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting, sortCustomerLists } from '@/utils';
import { findCompletedCustomers, findArchivedCustomers, getAllCustomers } from '@/repositories';
import useAuth from './useAuth';

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
  const { workspaceId } = useAuth();
  const [lists, setLists] = useState<CustomerHistory['lists']>({
    finalized: [],
    transfer: [],
    archived: [],
    longWait: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchCustomerHistory = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 👇 ADICIONE ESTE DELAY TEMPORÁRIO
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 3 segundos
        const [completed, archived, allCustomers] = await Promise.all([
          findCompletedCustomers(workspaceId),
          findArchivedCustomers(workspaceId),
          getAllCustomers(workspaceId),
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

        const sortedLists = sortCustomerLists(processed);
        setLists(sortedLists);
      } catch (error) {
        console.error('Erro ao buscar dados do histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerHistory();
  }, [refreshTrigger, workspaceId]);

  return {
    lists,
    loading,
    refresh,
  };
}

export default useCustomerHistory;
