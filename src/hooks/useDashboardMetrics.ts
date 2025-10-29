import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { getDaysWaiting } from '@/utils';

interface DashboardMetrics {
  totalActive: number;
  totalReadyForPickup: number;
  totalAwaitingTransfer: number;
  totalFinished: number;
  averageWaitTime: number;
  urgentCustomers: number;
}

function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalActive: 0,
    totalReadyForPickup: 0,
    totalAwaitingTransfer: 0,
    totalFinished: 0,
    averageWaitTime: 0,
    urgentCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const snapshot = await getDocs(query(collection(db, 'customers')));

        let urgentCount = 0;
        let totalDays = 0;
        let awaitingCount = 0;
        let awaitingTransferCount = 0;
        let readyForPickupCount = 0;
        let finishedCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();

          // PROTEÇÃO: Ignorar clientes arquivados
          if (data.archived) return;

          const status = data.status || 'pending';
          const daysWaiting = getDaysWaiting(data.createdAt);

          // Contadores por status
          if (status === 'pending') awaitingCount++;
          if (status === 'awaiting_transfer') awaitingTransferCount++;
          if (status === 'ready_for_pickup') readyForPickupCount++;
          if (status === 'completed') finishedCount++;

          // Urgente se aguardando há 7+ dias
          if (status === 'pending' && daysWaiting >= 7) {
            urgentCount++;
          }

          // Tempo médio apenas para aguardando
          if (status === 'pending') {
            totalDays += daysWaiting;
          }
        });

        const averageWaitTime =
          awaitingCount > 0 ? Math.round(totalDays / awaitingCount) : 0;

        setMetrics({
          totalActive: awaitingCount,
          totalReadyForPickup: readyForPickupCount,
          totalAwaitingTransfer: awaitingTransferCount,
          totalFinished: finishedCount,
          averageWaitTime: averageWaitTime,
          urgentCustomers: urgentCount,
        });
      } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);
  return { metrics, loading, refresh };
}

export default useDashboardMetrics;
