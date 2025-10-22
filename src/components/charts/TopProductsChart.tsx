import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTopProducts } from '@/hooks';
import { AnimatedContainer } from '@/components/animations';

function TopProductsChart() {
  const { products, loading } = useTopProducts(10);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Paleta de cores para as barras (tons de azul profissional)
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📊 Produtos Mais Procurados
        </h2>
        <p className="text-gray-500 text-center py-8">
          Nenhum produto cadastrado ainda
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Título */}
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        Produtos Mais Procurados
      </h3>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart
          data={products}
          layout="vertical"
          margin={{
            top: 5,
            right: isMobile ? 10 : 30,
            left: isMobile ? 10 : 20,
            bottom: 5,
          }}
        >
          {/* Grid de fundo */}
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          {/* Eixo X (quantidade) */}
          <XAxis
            type="number"
            tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
          />

          {/* Eixo Y (nomes dos produtos) */}
          <YAxis
            type="category"
            dataKey="name"
            width={isMobile ? 80 : 150}
            tick={{ fill: '#6B7280', fontSize: isMobile ? 9 : 12 }}
          />

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
            formatter={(value: number) => [
              `${value} ${value === 1 ? 'cliente' : 'clientes'}`,
              'Total',
            ]}
            labelStyle={{
              fontWeight: 'bold',
              marginBottom: '4px',
              color: '#3B82F6',
              fontSize: '13px',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />

          {/* Barras */}
          <Bar
            dataKey="count"
            radius={[0, 8, 8, 0]}
            barSize={isMobile ? 15 : 25}
          >
            {products.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legenda */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Baseado em {products.reduce((sum, p) => sum + p.count, 0)} reservas ativas
      </p>
    </div>
  );
}

export default TopProductsChart;
