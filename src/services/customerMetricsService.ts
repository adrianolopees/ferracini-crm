import { Customer } from '@/schemas/customerSchema';
import { getDaysWaiting } from '@/utils';

// Constantes de negócio centralizadas
export const LONG_WAIT_DAYS = 30;
export const URGENT_DAYS = 14;

export interface CustomerMetrics {
  totalActive: number;
  totalReadyForPickup: number;
  totalAwaitingTransfer: number;
  totalFinished: number;
  averageWaitTime: number;
  urgentCount: number;
  longWaitCount: number;
}

export interface CustomerLists extends Record<string, Customer[]> {
  awaiting: Customer[];
  awaitingTransfer: Customer[];
  readyForPickup: Customer[];
  longWait: Customer[];
  transfer: Customer[];
  finalized: Customer[];
  archived: Customer[];
}

export interface CustomerHistoryLists extends Record<string, Customer[]> {
  finalized: Customer[];
  transfer: Customer[];
  archived: Customer[];
  longWait: Customer[];
}

/**
 * Processa lista de clientes e calcula métricas + listas categorizadas
 */
export function processCustomersForDashboard(customers: Customer[]): {
  metrics: CustomerMetrics;
  lists: CustomerLists;
} {
  const processed = customers.reduce<{ metrics: CustomerMetrics; lists: CustomerLists; totalDays: number }>(
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

  // Calcula média
  const averageWaitTime =
    processed.metrics.totalActive > 0 ? Math.round(processed.totalDays / processed.metrics.totalActive) : 0;

  return {
    metrics: {
      ...processed.metrics,
      averageWaitTime,
    },
    lists: processed.lists,
  };
}

/**
 * Processa clientes para histórico
 */
export function processCustomersForHistory(
  allCustomers: Customer[],
  completed: Customer[],
  archived: Customer[]
): CustomerHistoryLists {
  const processed = allCustomers.reduce<CustomerHistoryLists>(
    (acc, customer) => {
      const isTransferred =
        (customer.sourceStore === 'Campinas' || customer.sourceStore === 'Dom Pedro') &&
        customer.status !== 'awaitingTransfer';

      if (isTransferred) {
        acc.transfer.push(customer);
      }

      if (!customer.archived && customer.status !== 'completed') {
        const daysWaiting = getDaysWaiting(customer.createdAt);
        if (daysWaiting >= LONG_WAIT_DAYS) {
          acc.longWait.push(customer);
        }
      }
      return acc;
    },
    {
      finalized: completed,
      transfer: [],
      archived: archived,
      longWait: [],
    }
  );

  return processed;
}
