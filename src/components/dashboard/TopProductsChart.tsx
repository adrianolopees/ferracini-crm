import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProductRanking } from '@/hooks';
import { Spinner } from '../ui';
import { AllProductsModal } from '../modals';
import type { Customer } from '@/schemas/customerSchema';

interface TopProductsChartProps {
  customers: Customer[];
  loading: boolean;
}

function TopProductsChart({ customers, loading }: TopProductsChartProps) {
  const { products, allProducts, totalReserves } = useProductRanking(customers, 10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const COLORS = [
    '#1E3A8A', // blue-900
    '#1E40AF', // blue-800
    '#1D4ED8', // blue-700
    '#2563EB', // blue-600
    '#3B82F6', // blue-500
    '#60A5FA', // blue-400
    '#93C5FD', // blue-300
    '#BFDBFE', // blue-200
    '#DBEAFE', // blue-100
    '#EFF6FF', // blue-50
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" color="blue" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Produtos Mais Procurados</h2>
        <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado ainda</p>
      </div>
    );
  }

  return (
    <div>
      {/* Título */}
      <h3 className="text-base text-center font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
        <i className="fa-solid fa-fire text-orange-500"></i>
        Top 10 Produtos Mais Procurados
      </h3>

      {/* Lista com Ranking — visível só no mobile */}
      <div className="block sm:hidden">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="space-y-3">
            {products.slice(0, 5).map((product, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const numberEmojis = ['4️⃣', '5️⃣'];
              const icon = index < 3 ? medals[index] : numberEmojis[index - 3];

              return (
                <div
                  key={product.name}
                  className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <span className="text-sm text-gray-700 font-medium truncate">{product.name}</span>
                  </div>
                  <span className="text-base font-bold text-blue-600 flex-shrink-0">{product.count}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-chart-simple text-blue-500"></i>
              <span className="text-xs text-gray-600">Total: {totalReserves} reservas</span>
            </div>
            {allProducts.length > 5 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-list text-[10px]"></i>
                Ver todos os {allProducts.length} modelos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico — visível só no desktop */}
      <div className="hidden sm:block">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={products}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #3B82F6',
                borderRadius: '12px',
                color: '#1F2937',
                padding: '12px 16px',
                fontSize: '14px',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)',
              }}
              formatter={(value: number) => [`${value} ${value === 1 ? 'cliente' : 'clientes'}`, 'Total']}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#3B82F6', fontSize: '13px' }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={25}>
              {products.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <i className="fa-solid fa-chart-simple text-blue-500"></i>
            Baseado em {totalReserves} reservas
          </p>
          {allProducts.length > 10 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-list text-[10px]"></i>
              Ver todos os {allProducts.length} modelos
            </button>
          )}
        </div>
      </div>

      <AllProductsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={allProducts}
        totalReserves={totalReserves}
      />
    </div>
  );
}

export default TopProductsChart;
