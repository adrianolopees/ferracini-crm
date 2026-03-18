import { useMemo } from 'react';
import type { Customer } from '@/schemas/customerSchema';

interface ProductCount {
  name: string;
  count: number;
}

interface ProductRankingData {
  products: ProductCount[];
  allProducts: ProductCount[];
  totalReserves: number;
}

function useProductRanking(customers: Customer[], limit: number = 10): ProductRankingData {
  return useMemo(() => {
    const modeloCounts: Record<string, number> = {};

    customers.forEach((customer) => {
      if (customer.model) {
        modeloCounts[customer.model] = (modeloCounts[customer.model] || 0) + 1;
      }
    });

    const allProducts = Object.entries(modeloCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      products: allProducts.slice(0, limit),
      allProducts,
      totalReserves: customers.length,
    };
  }, [customers, limit]);
}

export default useProductRanking;
