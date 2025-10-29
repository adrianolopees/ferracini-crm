import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer } from '@/types/customer';
import { getDaysWaiting } from '@/utils';

type FilterType =
  | 'all'
  | 'urgent'
  | 'awaiting_transfer'
  | 'ready_for_pickup'
  | 'finished';

interface UseCustomersListProps {
  filterType: FilterType;
  isOpen: boolean; // só busca quando modal abre
}

function useCustomersList({ filterType, isOpen }: UseCustomersListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchCustomers() {
      setLoading(true);
      try {
        let allCustomers: Customer[] = [];

        const customersQuery = query(collection(db, 'customers'));
        const snapshot = await getDocs(customersQuery);
        snapshot.forEach((doc) => {
          allCustomers.push({ id: doc.id, ...doc.data() } as Customer);
        });

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
        } else if (filterType === 'ready_for_pickup') {
          filtered = activeCustomers.filter(
            (c) => c.status === 'ready_for_pickup'
          );
        } else if (filterType === 'finished') {
          filtered = activeCustomers.filter((c) => c.status === 'completed');
        }

        // Ordenar por mais urgente
        filtered.sort(
          (a, b) => getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt)
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

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return { customers, loading, refresh };
}

export default useCustomersList;
