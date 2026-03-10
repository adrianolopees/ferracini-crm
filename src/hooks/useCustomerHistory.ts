import { useState, useEffect, useCallback } from 'react';
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
        const allCustomers = await getAllCustomers(workspaceId);

        const processedCustomer = processCustomersForHistory(
          allCustomers,
          transferStores.map((s) => s.name)
        );

        setLists(processedCustomer);
      } catch (error) {
        console.error('Erro ao buscar dados do histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerHistory();
  }, [refreshTrigger, workspaceId, transferStores]);

  return {
    lists,
    loading,
    refresh,
  };
}

export default useCustomerHistory;
