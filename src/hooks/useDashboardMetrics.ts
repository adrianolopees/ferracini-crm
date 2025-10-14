import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { getDaysWaiting } from '@/utils';

interface DashboardMetrics {
  totalActive: number;
  totalContacted: number;
  averageWaitTime: number;
  urgentCustomers: number;
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalActive: 0,
    totalContacted: 0,
    averageWaitTime: 0,
    urgentCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        let urgentCount = 0;
        let totalDays = 0;
        const customerQuery = query(collection(db, 'clientes'));
        const customersSnapshot = await getDocs(customerQuery);

        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          const daysWaiting = getDaysWaiting(data.dataCriacao);

          if (daysWaiting >= 7) {
            urgentCount++;
          }

          totalDays += daysWaiting;
        });

        const averageWaitTime =
          customersSnapshot.size > 0
            ? Math.round(totalDays / customersSnapshot.size)
            : 0;

        setMetrics({
          totalActive: customersSnapshot.size,
          totalContacted: 0,
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
  }, []);
  return { metrics, loading };
}

/* function calculateDaysWaiting(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
} */
