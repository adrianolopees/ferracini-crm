import { useState, useEffect, useCallback } from 'react';
import { getAllCustomers } from '@/repositories';

interface ProductCount {
  name: string;
  count: number;
}
interface ProductRankingData {
  products: ProductCount[];
  loading: boolean;
  refresh: () => void;
}

function useProductRanking(limit: number = 10): ProductRankingData {
  const [products, setProducts] = useState<ProductCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const allCustomers = await getAllCustomers();

        const modeloCounts: Record<string, number> = {};

        allCustomers.forEach((customer) => {
          const modelo = customer.model;

          if (modelo) {
            modeloCounts[modelo] = (modeloCounts[modelo] || 0) + 1;
          }
        });

        const productsArray = Object.entries(modeloCounts).map(([name, count]) => ({ name, count }));

        const sortedProducts = productsArray.sort((a, b) => b.count - a.count);

        const topProducts = sortedProducts.slice(0, limit);
        setProducts(topProducts);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [limit, refreshTrigger]);
  return { products, loading, refresh };
}

export default useProductRanking;
