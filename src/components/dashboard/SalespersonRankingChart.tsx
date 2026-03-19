import { useMemo } from 'react';
import type { Customer } from '@/schemas/customerSchema';

interface SalespersonRankingChartProps {
  customers: Customer[];
  loading?: boolean;
}

interface SalespersonStats {
  name: string;
  total: number;
  completed: number;
  archived: number;
  conversionRate: number;
}

function SalespersonRankingChart({ customers, loading = false }: SalespersonRankingChartProps) {
  const ranking = useMemo(() => {
    const stats: Record<string, SalespersonStats> = {};

    customers.forEach((customer) => {
      const name = customer.salesperson;
      if (!stats[name]) {
        stats[name] = { name, total: 0, completed: 0, archived: 0, conversionRate: 0 };
      }
      stats[name].total++;
      if (customer.status === 'completed' && !customer.archived) {
        stats[name].completed++;
      }
      if (customer.archived) {
        stats[name].archived++;
      }
    });

    return Object.values(stats)
      .map((s) => ({
        ...s,
        conversionRate:
          s.completed + s.archived > 0
            ? Math.round((s.completed / (s.completed + s.archived)) * 100)
            : 0,
      }))
      .sort((a, b) => b.completed - a.completed || b.total - a.total);
  }, [customers]);

  const hasData = ranking.length > 0;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-base text-center font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
        <i className="fa-solid fa-ranking-star text-yellow-500"></i>
        Ranking de Vendedores
      </h3>

      {loading || !hasData ? (
        <p className="text-center text-sm text-gray-400 py-4">
          {loading ? 'Carregando...' : 'Nenhum dado disponível'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="col-span-2">Vendedor</span>
            <span className="text-center">Vendas</span>
            <span className="text-center">Conversão</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {ranking.map((seller, index) => (
              <div
                key={seller.name}
                className="grid grid-cols-4 items-center px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                {/* Name + medal */}
                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {index < 3 ? medals[index] : (
                      <span className="text-xs font-bold text-gray-400 w-5 inline-block text-center">
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">{seller.name}</span>
                </div>

                {/* Vendas */}
                <div className="text-center">
                  <span className="text-sm font-bold text-emerald-600">{seller.completed}</span>
                  <span className="text-xs text-gray-400 ml-1">/ {seller.total}</span>
                </div>

                {/* Conversão */}
                <div className="text-center">
                  <span
                    className={`text-sm font-bold ${
                      seller.conversionRate >= 70
                        ? 'text-emerald-600'
                        : seller.conversionRate >= 40
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }`}
                  >
                    {seller.conversionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              {ranking.length} vendedor{ranking.length !== 1 ? 'es' : ''} · Taxa de conversão = vendas / (vendas + arquivados)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalespersonRankingChart;
