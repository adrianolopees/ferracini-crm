import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer } from '@/types/customer';
import { getDaysWaiting } from '@/utils';

type FilterType = 'all' | 'urgent' | 'contacted';

interface UseCustomersListProps {
  filterType: FilterType;
  isOpen: boolean; // só busca quando modal abre
}

export function useCustomersList({
  filterType,
  isOpen,
}: UseCustomersListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return; // não busca se modal está fechado

    async function fetchCustomers() {
      setLoading(true);
      try {
        const customersQuery = query(collection(db, 'clientes'));
        const snapshot = await getDocs(customersQuery);

        const allCustomers: Customer[] = [];
        snapshot.forEach((doc) => {
          allCustomers.push({ id: doc.id, ...doc.data() } as Customer);
        });

        // Filtrar baseado no tipo
        let filtered = allCustomers;

        if (filterType === 'urgent') {
          filtered = allCustomers.filter(
            (c) => getDaysWaiting(c.dataCriacao) >= 7
          );
        }

        // TODO: filterType === 'contacted' quando implementar histórico

        // Ordenar por mais urgente
        filtered.sort(
          (a, b) =>
            getDaysWaiting(b.dataCriacao) - getDaysWaiting(a.dataCriacao)
        );

        setCustomers(filtered);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [filterType, isOpen]);

  return { customers, loading };
}
