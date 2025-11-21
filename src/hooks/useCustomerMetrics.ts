import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from '@/utils';

interface DashboardData {
  metrics: {
    totalActive: number;
    totalReadyForPickup: number;
    totalAwaitingTransfer: number;
    totalFinished: number;
    averageWaitTime: number;
    urgentCount: number;
    longWaitCount: number;
  };
  lists: {
    awaiting: Customer[];
    awaitingTransfer: Customer[];
    readyForPickup: Customer[];
    longWait: Customer[];
    transfer: Customer[];
    finalized: Customer[];
    archived: Customer[];
  };
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

        let urgentCount = 0;
        let totalDays = 0;
        let awaitingCount = 0;
        let awaitingTransferCount = 0;
        let readyForPickupCount = 0;
        let longWaitCount = 0;
        let finishedCount = 0;

        const awaitingCustomers: Customer[] = [];
        const awaitingTransferCustomers: Customer[] = [];
        const readyForPickupCustomers: Customer[] = [];
        const longWaitCustomers: Customer[] = [];
        const transferCustomers: Customer[] = [];
        const finalizedCustomers: Customer[] = [];
        const archivedCustomers: Customer[] = [];

        allCustomers.forEach((customer) => {
          const isTransferred = customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro';

          if (isTransferred) {
            transferCustomers.push(customer);
          }

          if (customer.status === 'awaitingTransfer' && !customer.archived) {
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
              awaitingCount++;
              awaitingCustomers.push(customer);
              totalDays += daysWaiting;

              if (daysWaiting >= 15) {
                urgentCount++;
              }
            } else {
              longWaitCount++;
              longWaitCustomers.push(customer);
            }
          }

          if (status === 'awaitingTransfer') {
            awaitingTransferCount++;
          }

          if (status === 'readyForPickup') {
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
            urgentCount,
            longWaitCount,
          },
          lists: {
            awaiting: awaitingCustomers,
            awaitingTransfer: awaitingTransferCustomers,
            readyForPickup: readyForPickupCustomers,
            longWait: longWaitCustomers,
            transfer: transferCustomers,
            finalized: finalizedCustomers,
            archived: archivedCustomers,
          },
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
