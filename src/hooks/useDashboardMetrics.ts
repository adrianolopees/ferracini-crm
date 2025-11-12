import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
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
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const allCustomers = await getAllCustomers();

        let urgentCount = 0;
        let totalDays = 0;
        let awaitingCount = 0;
        let awaitingTransferCount = 0;
        let readyForPickupCount = 0;
        let finishedCount = 0;

        allCustomers.forEach((customer) => {
          // PROTEÇÃO: Ignorar clientes arquivados
          if (customer.archived) return;

          const status = customer.status || 'pending';
          const daysWaiting = getDaysWaiting(customer.createdAt);

          // Contadores por status (EXCLUIR clientes com 30+ dias do "pending")
          if (status === 'pending' && daysWaiting < 30) awaitingCount++;
          if (status === 'awaiting_transfer') awaitingTransferCount++;
          if (status === 'ready_for_pickup') readyForPickupCount++;
          if (status === 'completed') finishedCount++;

          // Urgente se aguardando há 7+ dias (mas menos de 30)
          if (status === 'pending' && daysWaiting >= 7 && daysWaiting < 30) {
            urgentCount++;
          }

          // Tempo médio apenas para aguardando (menos de 30 dias)
          if (status === 'pending' && daysWaiting < 30) {
            totalDays += daysWaiting;
          }
        });

        const averageWaitTime = awaitingCount > 0 ? Math.round(totalDays / awaitingCount) : 0;

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

  return { metrics, loading, refresh };
}

export default useDashboardMetrics;
