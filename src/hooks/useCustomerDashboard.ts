import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from '@/utils';

interface CustomerDashboard {
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
type AccumuladorType = Pick<CustomerDashboard, 'metrics' | 'lists'> & { totalDays: number };

function useCustomerDashboard(): CustomerDashboard {
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchCustomerMetrics() {
      setLoading(true);
      try {
        const allCustomers = await getAllCustomers();

        const LONG_WAIT_DAYS = 30;
        const URGENT_DAYS = 14;

        const processed = allCustomers.reduce<AccumuladorType>(
          (acc, customer) => {
            const isTransferred = customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro';
            if (isTransferred) {
              acc.lists.transfer.push(customer);
            }

            if (customer.status === 'awaitingTransfer' && !customer.archived) {
              acc.metrics.totalAwaitingTransfer++;
              acc.lists.awaitingTransfer.push(customer);
            }

            if (customer.archived) {
              acc.lists.archived.push(customer);
              return acc;
            }

            const status = customer.status || 'pending';
            switch (status) {
              case 'pending': {
                const daysWaiting = getDaysWaiting(customer.createdAt);

                if (daysWaiting < LONG_WAIT_DAYS) {
                  acc.metrics.totalActive++;
                  acc.lists.awaiting.push(customer);
                  acc.totalDays += daysWaiting;

                  if (daysWaiting >= URGENT_DAYS) {
                    acc.metrics.urgentCount++;
                  }
                } else {
                  acc.metrics.longWaitCount++;
                  acc.lists.longWait.push(customer);
                }
                break;
              }

              case 'readyForPickup':
                acc.metrics.totalReadyForPickup++;
                acc.lists.readyForPickup.push(customer);
                break;

              case 'completed':
                acc.metrics.totalFinished++;
                acc.lists.finalized.push(customer);
                break;
            }

            return acc;
          },
          {
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
            totalDays: 0,
          }
        );

        const averageWaitTime =
          processed.metrics.totalActive > 0 ? Math.round(processed.totalDays / processed.metrics.totalActive) : 0;

        const sortByDaysWaiting = (a: Customer, b: Customer) =>
          getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt);

        Object.values(processed.lists).forEach((list) => list.sort(sortByDaysWaiting));

        setData({
          metrics: {
            ...processed.metrics,
            averageWaitTime,
          },
          lists: processed.lists,
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerMetrics();
  }, [refreshTrigger]);

  return {
    ...data,
    loading,
    refresh,
  };
}

export default useCustomerDashboard;
