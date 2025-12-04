import { useState, useEffect, useCallback } from 'react';
import { sortCustomerLists } from '@/utils';
import { findCompletedCustomers, findArchivedCustomers, getAllCustomers } from '@/repositories';
import { processCustomersForHistory, CustomerHistoryLists } from '@/services/customerMetricsService';
import useAuth from './useAuth';

interface CustomerHistory {
  lists: CustomerHistoryLists;
  loading: boolean;
  refresh: () => void;
}

function useCustomerHistory(): CustomerHistory {
  const { workspaceId } = useAuth();
  const [lists, setLists] = useState<CustomerHistoryLists>({
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

        // 1. Busca dados (responsabilidade do hook)
        const [completed, archived, allCustomers] = await Promise.all([
          findCompletedCustomers(workspaceId),
          findArchivedCustomers(workspaceId),
          getAllCustomers(workspaceId),
        ]);

        // 2. Processa dados (delegado ao service)
        const processed = processCustomersForHistory(allCustomers, completed, archived);

        // 3. Ordena listas
        const sortedLists = sortCustomerLists(processed);

        // 4. Atualiza estado
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
