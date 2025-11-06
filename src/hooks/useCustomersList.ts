import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer } from '@/types/customer';
import { getDaysWaiting } from '@/utils';

type ModalType = 'awaiting' | 'awaiting_transfer' | 'ready_for_pickup' | null;

interface UseCustomersListProps {
  modalType: ModalType;
  isOpen: boolean;
}

function useCustomersList({ modalType, isOpen }: UseCustomersListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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

        if (modalType === 'awaiting') {
          // Modal "Aguardando" - mostra TODOS clientes pendentes
          filtered = activeCustomers.filter((c) => !c.status || c.status === 'pending');
        } else if (modalType === 'awaiting_transfer') {
          // Modal "Aguardando Transferência"
          filtered = activeCustomers.filter((c) => c.status === 'awaiting_transfer');
        } else if (modalType === 'ready_for_pickup') {
          // Modal "Pronto para Retirada"
          filtered = activeCustomers.filter((c) => c.status === 'ready_for_pickup');
        }

        // Ordenar por mais urgente
        filtered.sort((a, b) => getDaysWaiting(b.createdAt) - getDaysWaiting(a.createdAt));

        setCustomers(filtered);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [modalType, isOpen, refreshTrigger]);

  return { customers, loading, refresh };
}

export default useCustomersList;
