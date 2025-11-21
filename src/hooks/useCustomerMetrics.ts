import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from '@/utils';

interface DashboardData {
  // Métricas (substitui useDashboardMetrics)
  metrics: {
    totalActive: number;
    totalReadyForPickup: number;
    totalAwaitingTransfer: number;
    totalFinished: number;
    averageWaitTime: number;
    urgentCustomers: number;
  };
  // Clientes por status (substitui useCustomersList)
  customersByStatus: {
    awaiting: Customer[];
    awaiting_transfer: Customer[];
    ready_for_pickup: Customer[];
  };
  // Espera longa (substitui useLongWaitCustomers)
  longWaitCustomers: Customer[];
  longWaitCount: number;
  transferHistory: Customer[];

  finalizedCustomers: Customer[];
  archivedCustomers: Customer[];

  // Controles
  loading: boolean;
  refresh: () => void;
}

function useDashboardData(): DashboardData {
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [data, setData] = useState<DashboardData>({
    metrics: {
      totalActive: 0,
      totalReadyForPickup: 0,
      totalAwaitingTransfer: 0,
      totalFinished: 0,
      averageWaitTime: 0,
      urgentCustomers: 0,
    },
    customersByStatus: {
      awaiting: [],
      awaiting_transfer: [],
      ready_for_pickup: [],
    },
    longWaitCustomers: [],
    longWaitCount: 0,
    transferHistory: [],
    finalizedCustomers: [],
    archivedCustomers: [],
    loading: true,
    refresh: () => {},
  });

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const allCustomers = await getAllCustomers();

        // Contadores para métricas
        let urgentCount = 0;
        let totalDays = 0;
        let awaitingCount = 0;
        let awaitingTransferCount = 0;
        let readyForPickupCount = 0;
        let finishedCount = 0;

        // Arrays para separar clientes
        const awaitingCustomers: Customer[] = [];
        const awaitingTransferCustomers: Customer[] = [];
        const readyForPickupCustomers: Customer[] = [];
        const longWaitCustomers: Customer[] = [];
        const transferHistory: Customer[] = [];
        const finalizedCustomers: Customer[] = [];
        const archivedCustomers: Customer[] = [];

        allCustomers.forEach((customer) => {
          const isTransferred = customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro';

          if (isTransferred) {
            transferHistory.push(customer);
          }

          if (customer.status === 'awaiting_transfer' && !customer.archived) {
            awaitingTransferCustomers.push(customer);
          }

          if (customer.archived) {
            archivedCustomers.push(customer);
            return;
          }

          const status = customer.status || 'pending';
          const daysWaiting = getDaysWaiting(customer.createdAt);

          if (status === 'pending') {
            if (daysWaiting < 30) {
              // Menos de 30 dias: vai para "Aguardando" normal
              awaitingCount++;
              awaitingCustomers.push(customer);
              totalDays += daysWaiting;

              if (daysWaiting >= 15) {
                urgentCount++;
              }
            } else {
              // 30+ dias: vai para "Espera Longa"
              longWaitCustomers.push(customer);
            }
          }

          if (status === 'awaiting_transfer') {
            awaitingTransferCount++;
          }

          if (status === 'ready_for_pickup') {
            readyForPickupCount++;
            readyForPickupCustomers.push(customer);
          }

          if (status === 'completed') {
            finishedCount++;
            finalizedCustomers.push(customer);
          }
        });

        // Calcular média
        const averageWaitTime = awaitingCount > 0 ? Math.round(totalDays / awaitingCount) : 0;

        // Ordernar por quem espera a mais tempo
        const sortByDaysWaiting = (a: Customer, b: Customer) =>
          getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt);

        awaitingCustomers.sort(sortByDaysWaiting);
        awaitingTransferCustomers.sort(sortByDaysWaiting);
        readyForPickupCustomers.sort(sortByDaysWaiting);
        longWaitCustomers.sort(sortByDaysWaiting);
        finalizedCustomers.sort(sortByDaysWaiting);
        archivedCustomers.sort(sortByDaysWaiting);
        // Atualiza com TODOS os dados processados
        setData({
          metrics: {
            totalActive: awaitingCount,
            totalReadyForPickup: readyForPickupCount,
            totalAwaitingTransfer: awaitingTransferCount,
            totalFinished: finishedCount,
            averageWaitTime,
            urgentCustomers: urgentCount,
          },
          customersByStatus: {
            awaiting: awaitingCustomers,
            awaiting_transfer: awaitingTransferCustomers,
            ready_for_pickup: readyForPickupCustomers,
          },
          longWaitCustomers,
          longWaitCount: longWaitCustomers.length,
          finalizedCustomers,
          transferHistory,
          archivedCustomers,
          loading: false,
          refresh,
        });
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [refreshTrigger, refresh]);
  return {
    ...data,
    loading,
  };
}

export default useDashboardData;
