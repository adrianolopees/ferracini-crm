import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
import { processCustomersForDashboard } from '@/services/customerMetricsService';
import { sortCustomerLists } from '@/utils';
import useAuth from './useAuth';
import type { CustomerMetrics, CustomerLists } from '@/services/customerMetricsService';

interface CustomerDashboard {
  metrics: CustomerMetrics;
  lists: CustomerLists;
  loading: boolean;
  refresh: () => void;
}

function useCustomerDashboard(): CustomerDashboard {
  const { workspaceId } = useAuth();
  const [data, setData] = useState<Omit<CustomerDashboard, 'loading' | 'refresh'>>({
    metrics: {
      totalActive: 0,
      totalReadyForPickup: 0,
      totalAwaitingTransfer: 0,
      totalFinished: 0,
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
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

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

        const allCustomers = await getAllCustomers(workspaceId);

        const { metrics, lists } = processCustomersForDashboard(allCustomers);

        const sortedLists = sortCustomerLists(lists);

        setData({
          metrics,
          lists: sortedLists,
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerDashboard();
  }, [refreshTrigger, workspaceId]);

  return {
    ...data,
    loading,
    refresh,
  };
}

export default useCustomerDashboard;
