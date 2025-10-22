import { useState } from 'react';
import { Navigation, PageHeader } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { useDashboardMetrics } from '@/hooks';
import { useCustomersList } from '@/hooks';
import { CustomerListModal } from '@/components/features';
import { Customer } from '@/types/customer';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';
import { TopProductsChart } from '@/components/charts';
import {
  notifyOtherStore,
  checkLojaCampinas,
  checkLojaDomPedro,
  notifyProductArrived,
} from '@/services/whatsappService';
import {
  moveToAwaitingTransfer,
  markAsContacted,
  moveToFinished,
} from '@/services/customerStatusService';

function Dashboard() {
  const { metrics, loading } = useDashboardMetrics();

  // Estado para controlar qual modal está aberto
  const [modalType, setModalType] = useState<
    'all' | 'urgent' | 'awaiting_transfer' | 'contacted' | 'finished' | null
  >(null);

  // Hook para buscar clientes filtrados
  const { customers, loading: customersLoading } = useCustomersList({
    filterType: modalType || 'all',
    isOpen: modalType !== null,
  });

  // Função para avisar cliente que tem em outra loja
  const handleWhatsApp = (customer: Customer) => {
    notifyOtherStore(customer);
    toast('WhatsApp aberto para contatar cliente');
  };

  // Função para verificar disponibilidade na Loja Campinas
  const handleCheckLojaCampinas = (customer: Customer) => {
    checkLojaCampinas(customer);
    toast('Consulta enviada para Loja Campinas');
  };

  // Função para verificar disponibilidade na Loja Dom Pedro
  const handleCheckLojaDomPedro = (customer: Customer) => {
    checkLojaDomPedro(customer);
    toast('Consulta enviada para Loja Dom Pedro');
  };

  // Função para deletar cliente
  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Deseja excluir ${customer.cliente}?`)) return;

    try {
      await deleteDoc(doc(db, 'clientes', customer.id));
      toast.success(`Cliente ${customer.cliente} excluído!`);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  // Função para aceitar transferência de outra loja
  const handleAcceptTransfer = async (
    customer: Customer,
    store: 'Campinas' | 'Dom Pedro'
  ) => {
    try {
      await moveToAwaitingTransfer(customer, store);
      toast.success(
        `${customer.cliente} aguardando transferência de ${store}!`
      );
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Função para quando produto chega
  const handleProductArrived = async (customer: Customer) => {
    try {
      await markAsContacted(customer);
      notifyProductArrived(customer);
      toast.success(`${customer.cliente} movido para Contactados!`);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Função para quando cliente compra
  const handlePurchaseCompleted = async (customer: Customer) => {
    try {
      const isFromContactedCollection =
        customer._isFromContactedCollection || false;
      await moveToFinished(customer, isFromContactedCollection);
      toast.success(`Venda de ${customer.cliente} finalizada!`);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao finalizar venda');
    }
  };

  // Função para obter título do modal
  const getModalTitle = () => {
    if (modalType === 'all')
      return `Clientes Aguardando (${metrics.totalActive})`;
    if (modalType === 'urgent')
      return `Clientes Urgentes (${metrics.urgentCustomers})`;
    if (modalType === 'awaiting_transfer')
      return `Aguardando Transferência (${metrics.totalAwaitingTransfer})`;
    if (modalType === 'contacted')
      return `Clientes Contactados (${metrics.totalContacted})`;
    if (modalType === 'finished')
      return `Vendas Finalizadas (${metrics.totalFinished})`;
    return '';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        {/* Header */}
        <AnimatedContainer type="slideDown">
          <PageHeader
            title="Painel de"
            highlight="Estatísticas"
            subtitle="Acompanhe reservas, contatos e métricas em tempo real"
          />
        </AnimatedContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-7xl mx-auto">
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

          {/* Card 2: Aguardando Transferência */}
          <AnimatedContainer type="slideDown" delay={0.2}>
            <div
              onClick={() => setModalType('awaiting_transfer')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Aguardando Transferência
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-yellow-500"></i>
                    ) : (
                      metrics.totalAwaitingTransfer
                    )}
                  </p>
                </div>
                <div className="bg-yellow-100 rounded-full p-4">
                  <i className="fa-solid fa-truck text-2xl text-yellow-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Produtos em transferência
              </p>
            </div>
          </AnimatedContainer>

          {/* Card 3: Clientes Contactados */}
          <AnimatedContainer type="slideUp" delay={0.3}>
            <div
              onClick={() => setModalType('contacted')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer"
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

          {/* Card 5: Vendas Finalizadas */}
          <AnimatedContainer type="slideUp" delay={0.5}>
            <div
              onClick={() => setModalType('finished')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Finalizados
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-emerald-500"></i>
                    ) : (
                      metrics.totalFinished
                    )}
                  </p>
                </div>
                <div className="bg-emerald-100 rounded-full p-4">
                  <i className="fa-solid fa-circle-check text-2xl text-emerald-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Vendas concluídas com sucesso
              </p>
            </div>
          </AnimatedContainer>

          {/* Card 6: Tempo Médio */}
          <AnimatedContainer type="slideUp" delay={0.6}>
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
          onCheckLojaCampinas={handleCheckLojaCampinas}
          onCheckLojaDomPedro={handleCheckLojaDomPedro}
          onAcceptTransfer={handleAcceptTransfer}
          onProductArrived={handleProductArrived}
          onPurchaseCompleted={handlePurchaseCompleted}
        />
      </main>
    </div>
  );
}

export default Dashboard;
