import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllCustomers, updateCustomer } from '@/repositories';
import { getCurrentTimestamp } from '@/utils';
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

  const processed = useMemo<CustomerHistoryLists>(
    () =>
      processCustomersForHistory(
        allCustomers,
        transferStores.map((s) => s.name)
      ),
    [allCustomers, transferStores]
  );

  useEffect(() => {
    if (processed.toAutoArchive.length === 0) return;

    const archiveExceeded = async () => {
      await Promise.all(
        processed.toAutoArchive.map((customer) =>
          updateCustomer(customer.id, {
            archived: true,
            archiveReason: 'exceeded_wait_time',
            archivedAt: getCurrentTimestamp(),
            notes: 'Arquivado automaticamente por exceder 60 dias de espera',
          })
        )
      );
      setRefreshTrigger((prev) => prev + 1);
    };

    archiveExceeded();
  }, [processed.toAutoArchive]);

  return {
    lists: processed,
    loading,
    refresh,
  };
}

export default useCustomerHistory;
