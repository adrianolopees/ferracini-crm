import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { getDaysWaiting } from '@/utils';

interface DashboardMetrics {
  totalActive: number;
  totalContacted: number;
  totalAwaitingTransfer: number;
  totalFinished: number;
  averageWaitTime: number;
  urgentCustomers: number;
}

interface UseDashboardMetricsProps {
  refreshTrigger?: number;
}

function useDashboardMetrics(props?: UseDashboardMetricsProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalActive: 0,
    totalContacted: 0,
    totalAwaitingTransfer: 0,
    totalFinished: 0,
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
        let awaitingCount = 0;
        let awaitingTransferCount = 0;
        let contactedCount = 0;
        let finishedCount = 0;

        clientesSnapshot.forEach((doc) => {
          const data = doc.data();

          // PROTEÇÃO: Ignorar clientes arquivados
          if (data.arquivado) return;

          const status = data.status || 'aguardando'; // backward compatibility
          const daysWaiting = getDaysWaiting(data.dataCriacao);

          // Contadores por status
          if (status === 'aguardando') awaitingCount++;
          if (status === 'aguardando_transferencia') awaitingTransferCount++;
          if (status === 'contactado') contactedCount++;
          if (status === 'finalizado') finishedCount++;

          // Urgente se aguardando há 7+ dias
          if (status === 'aguardando' && daysWaiting >= 7) {
            urgentCount++;
          }

          // Tempo médio apenas para aguardando
          if (status === 'aguardando') {
            totalDays += daysWaiting;
          }
        });

        const averageWaitTime =
          awaitingCount > 0 ? Math.round(totalDays / awaitingCount) : 0;

        // Incluir dados legados do 'contacted' na contagem de contactados (exceto arquivados)
        let contactedLegacyCount = 0;
        contactedSnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.arquivado) {
            contactedLegacyCount++;
          }
        });

        const totalContactedWithLegacy = contactedCount + contactedLegacyCount;

        setMetrics({
          totalActive: awaitingCount,
          totalContacted: totalContactedWithLegacy,
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
  }, [props?.refreshTrigger]);
  return { metrics, loading };
}

export default useDashboardMetrics;
