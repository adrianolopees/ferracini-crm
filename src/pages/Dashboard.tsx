import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useCustomersList } from '@/hooks/useCustomersList';
import { CustomerListModal } from '@/components/CustomerListModal';
import { Customer } from '@/types/customer';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';
import { TopProductsChart } from '@/components/TopProductsChart';

function Dashboard() {
  const { user } = useAuth();
  const { metrics, loading } = useDashboardMetrics();

  // Estado para controlar qual modal está aberto
  const [modalType, setModalType] = useState<'all' | 'urgent' | null>(null);

  // Hook para buscar clientes filtrados
  const { customers, loading: customersLoading } = useCustomersList({
    filterType: modalType || 'all',
    isOpen: modalType !== null,
  });

  // Função para enviar WhatsApp
  const handleWhatsApp = (customer: Customer) => {
    const mensagem = `Oi ${customer.cliente}! Ferracini Maxi Shopping aqui! O ${customer.modelo} que você procurava chegou! Posso reservar pra você?`;
    const celularSomenteNumeros = customer.celular.replace(/\D/g, '');
    const urlWhatsApp = `https://wa.me/55${celularSomenteNumeros}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
  };

  // Função para deletar cliente
  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Deseja excluir ${customer.cliente}?`)) return;

    try {
      await deleteDoc(doc(db, 'clientes', customer.id));
      toast.success(`Cliente ${customer.cliente} excluído!`);
      // Recarregar a página para atualizar métricas
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  // Função para obter título do modal
  const getModalTitle = () => {
    if (modalType === 'all')
      return `Clientes Aguardando (${metrics.totalActive})`;
    if (modalType === 'urgent')
      return `Clientes Urgentes (${metrics.urgentCustomers})`;
    return '';
  };

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
            <div
              onClick={() => setModalType('all')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
            >
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
            <div
              onClick={() =>
                toast.custom((t) => (
                  <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg">
                    ℹ️ Histórico será implementado em breve!
                  </div>
                ))
              }
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer opacity-75"
            >
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
            <div
              onClick={() => setModalType('all')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer"
            >
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
            <div
              onClick={() => setModalType('urgent')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow cursor-pointer"
            >
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
        <div className="px-4 max-w-7xl mx-auto pb-8">
          <TopProductsChart />
        </div>

        {/* Modal de Lista de Clientes */}
        <CustomerListModal
          isOpen={modalType !== null}
          onClose={() => setModalType(null)}
          title={getModalTitle()}
          customers={customers}
          loading={customersLoading}
          onWhatsApp={handleWhatsApp}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default Dashboard;
