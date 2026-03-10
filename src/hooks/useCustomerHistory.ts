import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCustomers } from '@/repositories';
import { processCustomersForHistory, CustomerHistoryLists } from '@/services/customerMetricsService';
import useAuth from './useAuth';
import useStoreSettings from './useStoreSettings';

interface CustomerHistory {
  lists: CustomerHistoryLists;
  loading: boolean;
  refresh: () => void;
}

function useCustomerHistory(): CustomerHistory {
  const { workspaceId } = useAuth();
  const { transferStores } = useStoreSettings();
  const [allCustomers, setAllCustomers] = useState<Awaited<ReturnType<typeof getAllCustomers>>>([]);
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
        const customers = await getAllCustomers(workspaceId);
        setAllCustomers(customers);
      } catch (error) {
        console.error('Erro ao buscar dados do histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerHistory();
  }, [refreshTrigger, workspaceId]);

  const lists = useMemo<CustomerHistoryLists>(
    () => processCustomersForHistory(allCustomers, transferStores.map((s) => s.name)),
    [allCustomers, transferStores]
  );

  return {
    lists,
    loading,
    refresh,
  };
}

export default useCustomerHistory;
