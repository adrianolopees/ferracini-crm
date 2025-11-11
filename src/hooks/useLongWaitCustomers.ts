import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer } from '@/types/customer';
import { getDaysWaiting } from '@/utils/date';

function useLongWaitCustomers() {
  const [count, setCount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLongWaitCustomers = async () => {
    setLoading(true);
    try {
      const customersQuery = query(collection(db, 'customers'));
      const snapshot = await getDocs(customersQuery);

      let allCustomers: Customer[] = [];
      snapshot.forEach((doc) => {
        allCustomers.push({ id: doc.id, ...doc.data() } as Customer);
      });

      // Filtrar: ativos + aguardando + 30 dias ou mais
      const longWaitCustomers = allCustomers.filter((c) => {
        const isActive = !c.archived;
        const isPending = !c.status || c.status === 'pending';
        const isLongWait = getDaysWaiting(c.createdAt) >= 30;
        return isActive && isPending && isLongWait;
      });

      setCustomers(longWaitCustomers);
      setCount(longWaitCustomers.length);
    } catch (error) {
      console.error('Erro ao buscar clientes em espera longa:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLongWaitCustomers();
  }, []);

  return { count, customers, loading, refresh: fetchLongWaitCustomers };
}

export default useLongWaitCustomers;
