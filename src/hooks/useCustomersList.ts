import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer } from '@/types/customer';
import { getDaysWaiting } from '@/utils';

type FilterType =
  | 'all'
  | 'urgent'
  | 'awaiting_transfer'
  | 'contacted'
  | 'finished';

interface UseCustomersListProps {
  filterType: FilterType;
  isOpen: boolean; // só busca quando modal abre
  refreshTrigger?: number; // trigger para forçar atualização
}

function useCustomersList({ filterType, isOpen, refreshTrigger }: UseCustomersListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // não busca se modal está fechado

    async function fetchCustomers() {
      setLoading(true);
      try {
        let allCustomers: Customer[] = [];

        // Para 'contacted', buscar da coleção 'contacted' (dados legados)
        if (filterType === 'contacted') {
          const contactedQuery = query(collection(db, 'contacted'));
          const snapshot = await getDocs(contactedQuery);
          snapshot.forEach((doc) => {
            allCustomers.push({
              id: doc.id,
              ...doc.data(),
              status: 'ready_for_pickup', // Garante que clientes legados tenham status
              _isFromContactedCollection: true,
            } as Customer);
          });

          // Também buscar de 'customers' com status 'ready_for_pickup'
          const customersQuery = query(collection(db, 'customers'));
          const customersSnapshot = await getDocs(customersQuery);
          customersSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'ready_for_pickup') {
              allCustomers.push({ id: doc.id, ...data } as Customer);
            }
          });
        } else {
          // Para outros filtros, buscar apenas de 'customers'
          const customersQuery = query(collection(db, 'customers'));
          const snapshot = await getDocs(customersQuery);
          snapshot.forEach((doc) => {
            allCustomers.push({ id: doc.id, ...doc.data() } as Customer);
          });
        }

        // Primeiro: filtrar clientes arquivados (não mostrar em nenhuma lista)
        const activeCustomers = allCustomers.filter((c) => !c.archived);

        // Filtrar baseado no tipo
        let filtered = activeCustomers;

        if (filterType === 'all') {
          filtered = activeCustomers.filter(
            (c) => !c.status || c.status === 'pending'
          );
        } else if (filterType === 'urgent') {
          filtered = activeCustomers.filter(
            (c) =>
              (!c.status || c.status === 'pending') &&
              getDaysWaiting(c.createdAt) >= 7
          );
        } else if (filterType === 'awaiting_transfer') {
          filtered = activeCustomers.filter(
            (c) => c.status === 'awaiting_transfer'
          );
        } else if (filterType === 'finished') {
          filtered = activeCustomers.filter((c) => c.status === 'completed');
        }
        // filterType === 'contacted' já está filtrado acima

        // Ordenar por mais urgente
        filtered.sort(
          (a, b) =>
            getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt)
        );

        setCustomers(filtered);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [filterType, isOpen, refreshTrigger]);

  return { customers, loading };
}

export default useCustomersList;
