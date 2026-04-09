import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
import { processCustomersForDashboard } from '@/services/customerMetricsService';
import useAuth from './useAuth';
import useStoreSettings from './useStoreSettings';
import { getFirebaseErrorMessage } from '@/utils';
import type { CustomerMetrics, CustomerLists } from '@/services/customerMetricsService';
import type { Customer } from '@/schemas/customerSchema';

interface CustomerDashboard {
  metrics: CustomerMetrics;
  lists: CustomerLists;
  allCustomers: Customer[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

function useCustomerDashboard(): CustomerDashboard {
  const { workspaceId } = useAuth();
  const { transferStores } = useStoreSettings();
  const [data, setData] = useState<Omit<CustomerDashboard, 'loading' | 'refresh' | 'error'>>({
    metrics: {
      totalActive: 0,
      totalReadyForPickup: 0,
      totalAwaitingTransfer: 0,
      totalFinished: 0,
      totalArchived: 0,
      averageWaitTime: 0,
      urgentCount: 0,
      longWaitCount: 0,
    },
    lists: {
      awaiting: [],
      awaitingTransfer: [],
      readyForPickup: [],
      longWait: [],
      transfer: [],
      finalized: [],
      archived: [],
    },
    allCustomers: [],
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchCustomerDashboard = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const allCustomers = await getAllCustomers(workspaceId);

        const { metrics, lists } = processCustomersForDashboard(
          allCustomers,
          transferStores.map((s) => s.name)
        );

        setData({
          metrics,
          lists,
          allCustomers,
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError(getFirebaseErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerDashboard();
  }, [refreshTrigger, workspaceId, transferStores]);

  return {
    ...data,
    loading,
    error,
    refresh,
  };
}

export default useCustomerDashboard;
