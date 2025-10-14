import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';

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
        const customerQuery = query(collection(db, 'customers'));
        const customersSnapshot = await getDocs(customerQuery);
        // Por enquanto, a coleção 'contacted' não existe ainda

        setMetrics({
          totalActive: customersSnapshot.size,
          totalContacted: 0,
          averageWaitTime: 0,
          urgentCustomers: 0,
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
