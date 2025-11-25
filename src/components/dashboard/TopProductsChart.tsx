import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProductRanking } from '@/hooks';

function TopProductsChart() {
  const { products, totalReserves, loading } = useProductRanking(10);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Paleta de cores para as barras
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
          <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i>
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
        Produtos Mais Procurados
      </h3>

      {/* Lista com Ranking para Mobile */}
      {isMobile && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="space-y-3">
            {products.slice(0, 5).map((product, index) => {
              // Definir medalhas e emojis
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

          {/* Mensagem e Total */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            {products.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{products.length - 5} produtos • Ver todos no desktop
              </p>
            )}
            <div className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-chart-simple text-blue-500"></i>
              <span className="text-xs text-gray-600">
                Total: {products.reduce((sum, p) => sum + p.count, 0)} reservas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico - Oculto em Mobile */}
      {!isMobile && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={products}
            layout="vertical"
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            {/* Grid de fundo */}
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

            {/* Eixo X (quantidade) */}
            <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />

            {/* Eixo Y (nomes dos produtos) */}
            <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#6B7280', fontSize: 12 }} />

            {/* Tooltip ao passar mouse */}
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
              labelStyle={{
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#3B82F6',
                fontSize: '13px',
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />

            {/* Barras */}
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={25}>
              {products.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legenda - Apenas Desktop */}
      {!isMobile && (
        <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
          <i className="fa-solid fa-chart-simple text-blue-500"></i>
          Baseado em {totalReserves} reservas
        </p>
      )}
    </div>
  );
}

export default TopProductsChart;
