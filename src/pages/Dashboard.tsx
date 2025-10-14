import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

function Dashboard() {
  const { user } = useAuth();
  const { metrics, loading } = useDashboardMetrics();
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Header */}
        <AnimatedContainer type="slideDown" className="text-center mb-8 mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Painel de <span className="text-blue-600">Estatísticas</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Acompanhe reservas, contatos e métricas em tempo real
          </p>
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
          {/* Card 1: Clientes Aguardando */}
          <AnimatedContainer type="slideDown" delay={0.1}>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Aguardando
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>
                    ) : (
                      metrics.totalActive
                    )}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-4">
                  <i className="fa-solid fa-clock text-2xl text-blue-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Clientes na fila de espera
              </p>
            </div>
          </AnimatedContainer>

          {/* Card 2: Clientes Contactados */}
          <AnimatedContainer type="slideDown" delay={0.2}>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Contactados
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-green-500"></i>
                    ) : (
                      metrics.totalContacted
                    )}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-4">
                  <i className="fa-brands fa-whatsapp text-2xl text-green-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Total de clientes atendidos
              </p>
            </div>
          </AnimatedContainer>

          {/* Card 3: Tempo Médio */}
          <AnimatedContainer type="slideUp" delay={0.3}>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tempo Médio
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-purple-500"></i>
                    ) : (
                      `${metrics.averageWaitTime}d`
                    )}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-4">
                  <i className="fa-solid fa-hourglass-half text-2xl text-purple-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Dias até o primeiro contato
              </p>
            </div>
          </AnimatedContainer>

          {/* Card 4: Casos Urgentes */}
          <AnimatedContainer type="slideUp" delay={0.4}>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Urgentes
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-red-500"></i>
                    ) : (
                      metrics.urgentCustomers
                    )}
                  </p>
                </div>
                <div className="bg-red-100 rounded-full p-4">
                  <i className="fa-solid fa-triangle-exclamation text-2xl text-red-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Mais de 7 dias aguardando
              </p>
            </div>
          </AnimatedContainer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
