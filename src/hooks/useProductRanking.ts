import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';
import useAuth from './useAuth'; // ← NOVO IMPORT

interface ProductCount {
  name: string;
  count: number;
}

interface ProductRankingData {
  products: ProductCount[];
  totalReserves: number;
  loading: boolean;
  refresh: () => void;
}

function useProductRanking(limit: number = 10): ProductRankingData {
  const { workspaceId } = useAuth(); // ← NOVO: buscar workspaceId
  const [products, setProducts] = useState<ProductCount[]>([]);
  const [totalReserves, setTotalReserves] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchProductRanking = async () => {
      // ← NOVO: só carrega se tiver workspaceId
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allCustomers = await getAllCustomers(workspaceId); // ← NOVO: passar workspaceId

        const modeloCounts: Record<string, number> = {};

        allCustomers.forEach((customer) => {
          if (customer.model) {
            modeloCounts[customer.model] = (modeloCounts[customer.model] || 0) + 1;
          }
        });

        const totalReserves = Object.values(modeloCounts).reduce((a, b) => a + b, 0);

        const topProducts = Object.entries(modeloCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);

        setTotalReserves(totalReserves);
        setProducts(topProducts);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductRanking();
  }, [limit, refreshTrigger, workspaceId]); // ← NOVO: adicionar workspaceId nas dependências
  return { products, totalReserves, loading, refresh };
}

export default useProductRanking;
