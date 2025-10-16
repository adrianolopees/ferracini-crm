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
        // Buscar clientes ativos e contactados ao mesmo tempo
        const [clientesSnapshot, contactedSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'clientes'))),
          getDocs(query(collection(db, 'contacted'))),
        ]);

        let urgentCount = 0;
        let totalDays = 0;

        clientesSnapshot.forEach((doc) => {
          const data = doc.data();
          const daysWaiting = getDaysWaiting(data.dataCriacao);

          if (daysWaiting >= 7) {
            urgentCount++;
          }

          totalDays += daysWaiting;
        });

        const averageWaitTime =
          clientesSnapshot.size > 0
            ? Math.round(totalDays / clientesSnapshot.size)
            : 0;

        setMetrics({
          totalActive: clientesSnapshot.size,
          totalContacted: contactedSnapshot.size, // 👈 BUSCA REAL DO BANCO
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
