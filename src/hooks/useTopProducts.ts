import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

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
        const snapshot = await getDocs(collection(db, 'customers'));

        const modeloCounts: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          const modelo = data.model;

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
