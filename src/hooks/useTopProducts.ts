import { useState, useEffect } from 'react';
import { getAllCustomers } from '@/repositories';

interface ProductCount {
  name: string;
  count: number;
}

function useTopProducts(limit: number = 10) {
  const [products, setProducts] = useState<ProductCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
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
  }, [limit]);
  return { products, loading };
}

export default useTopProducts;
