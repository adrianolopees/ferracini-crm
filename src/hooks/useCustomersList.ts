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
}

function useCustomersList({ filterType, isOpen }: UseCustomersListProps) {
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
              _isFromContactedCollection: true,
            } as Customer);
          });

          // Também buscar de 'clientes' com status 'contactado'
          const customersQuery = query(collection(db, 'clientes'));
          const customersSnapshot = await getDocs(customersQuery);
          customersSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'contactado') {
              allCustomers.push({ id: doc.id, ...data } as Customer);
            }
          });
        } else {
          // Para outros filtros, buscar apenas de 'clientes'
          const customersQuery = query(collection(db, 'clientes'));
          const snapshot = await getDocs(customersQuery);
          snapshot.forEach((doc) => {
            allCustomers.push({ id: doc.id, ...doc.data() } as Customer);
          });
        }

        // Primeiro: filtrar clientes arquivados (não mostrar em nenhuma lista)
        const activeCustomers = allCustomers.filter((c) => !c.arquivado);

        // Filtrar baseado no tipo
        let filtered = activeCustomers;

        if (filterType === 'all') {
          filtered = activeCustomers.filter(
            (c) => !c.status || c.status === 'aguardando'
          );
        } else if (filterType === 'urgent') {
          filtered = activeCustomers.filter(
            (c) =>
              (!c.status || c.status === 'aguardando') &&
              getDaysWaiting(c.dataCriacao) >= 7
          );
        } else if (filterType === 'awaiting_transfer') {
          filtered = activeCustomers.filter(
            (c) => c.status === 'aguardando_transferencia'
          );
        } else if (filterType === 'finished') {
          filtered = activeCustomers.filter((c) => c.status === 'finalizado');
        }
        // filterType === 'contacted' já está filtrado acima

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

export default useCustomersList;
