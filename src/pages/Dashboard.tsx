import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArchiveModal, PageLayout } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import {
  CustomerListModal,
  ActionCard,
  MetricCard,
} from '@/components/features';
import { TopProductsChart } from '@/components/charts';
import { useDashboardMetrics, useCustomersList } from '@/hooks';
import { useCustomerActions } from '@/hooks';
import { Customer, ArchiveReason } from '@/types/customer';
import { sendGenericMessage } from '@/services/whatsappService';

function Dashboard() {
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(
    null
  );
  const [modalType, setModalType] = useState<
    'awaiting' | 'awaiting_transfer' | 'ready_for_pickup' | null
  >(null);

  const {
    checkStoreCampinas,
    checkStoreDomPedro,
    confirmStoreStock,
    acceptTransfer,
    rejectStoreStock,
    productArrived,
    declineTransfer,
    completeOrder,
  } = useCustomerActions();

  const { metrics, loading, refresh: refreshMetrics } = useDashboardMetrics();
  // Hook para buscar clientes filtrados
  const {
    customers,
    loading: customersLoading,
    refresh: refreshCustomers,
  } = useCustomersList({
    modalType,
    isOpen: modalType !== null,
  });

  const refreshAll = () => {
    refreshMetrics();
    refreshCustomers();
  };

  // Handlers para ações dos clientes
  const handleWhatsApp = (customer: Customer) => {
    sendGenericMessage(customer);
  };

  const handleCheckStoreCampinas = async (customer: Customer) => {
    try {
      await checkStoreCampinas(customer);
      toast('WhatsApp enviado para Loja Campinas');
      refreshCustomers();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao consultar loja');
    }
  };

  const handleCheckStoreDomPedro = async (customer: Customer) => {
    try {
      await checkStoreDomPedro(customer);
      toast('WhatsApp enviado para Loja Dom Pedro');
      refreshCustomers();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao consultar loja');
    }
  };

  const handleConfirmStoreStock = async (customer: Customer) => {
    try {
      await confirmStoreStock(customer);
      refreshCustomers();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao notificar cliente');
    }
  };

  const handleRejectStoreStock = async (customer: Customer) => {
    try {
      await rejectStoreStock(customer);
      toast('Produto não disponível. Pode consultar outra loja.');
      refreshCustomers(); // Atualiza lista sem recarregar
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleAcceptTransfer = async (customer: Customer) => {
    try {
      await acceptTransfer(customer);
      toast.success(`Transferência confirmada de ${customer.consultingStore}!`);
      refreshAll(); // Atualiza lista e métricas
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao confirmar transferência');
    }
  };

  const handleDeclineTransfer = (customer: Customer) => {
    setModalType(null); // Fecha o modal de lista
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  // Função para abrir modal de arquivamento
  const handleArchive = (customer: Customer) => {
    setModalType(null); // Fecha o modal de lista primeiro
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  const handleArchiveCustomer = async (
    reason: ArchiveReason,
    notes?: string
  ) => {
    if (!customerToArchive) return;

    try {
      await declineTransfer(customerToArchive, reason, notes || '');
      toast.success(`${customerToArchive.name} arquivado com sucesso!`);
      setArchiveModalOpen(false);
      setCustomerToArchive(null);
      refreshAll();
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      toast.error('Erro ao arquivar cliente');
    }
  };

  const handleProductArrived = async (customer: Customer) => {
    try {
      await productArrived(customer);
      refreshAll();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleCompleteOrder = async (customer: Customer) => {
    try {
      await completeOrder(customer);
      toast.success(`Venda de ${customer.name} finalizada!`);
      refreshAll(); // Atualiza lista e métricas
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao finalizar venda');
    }
  };

  // Função para obter título do modal
  const getModalTitle = () => {
    if (modalType === 'awaiting') return 'Clientes Aguardando';
    if (modalType === 'awaiting_transfer')
      return `Aguardando Transferência (${metrics.totalAwaitingTransfer})`;
    if (modalType === 'ready_for_pickup') return 'Pronto para Retirada';
    return '';
  };

  return (
    <PageLayout
      title="Gestão de"
      highlight="Clientes"
      subtitle="Gerencie o fluxo de clientes em tempo real"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
        {/* Card 1: Clientes Aguardando */}
        <AnimatedContainer type="slideDown" delay={0.1}>
          <ActionCard
            title="Aguardando"
            value={metrics.totalActive}
            subtitle={
              metrics.urgentCustomers > 0
                ? `${metrics.urgentCustomers} urgente(s)`
                : 'Clientes na fila de espera'
            }
            icon="fa-solid fa-clock"
            colorScheme="blue"
            loading={loading}
            onClick={() => setModalType('awaiting')}
          />
        </AnimatedContainer>

        {/* Card 2: Aguardando Transferência */}
        <AnimatedContainer type="slideDown" delay={0.2}>
          <ActionCard
            title="Aguardando Transferência"
            value={metrics.totalAwaitingTransfer}
            subtitle="Produtos em transferência"
            icon="fa-solid fa-truck"
            colorScheme="yellow"
            loading={loading}
            onClick={() => setModalType('awaiting_transfer')}
          />
        </AnimatedContainer>

        {/* Card 3: Pronto para Retirada */}
        <AnimatedContainer type="slideDown" delay={0.3}>
          <ActionCard
            title="Pronto para Retirada"
            value={metrics.totalReadyForPickup}
            subtitle={
              metrics.totalFinished > 0
                ? `${metrics.totalFinished} venda(s) finalizada(s)`
                : 'Produtos disponíveis para o cliente'
            }
            icon="fa-solid fa-box-open"
            colorScheme="green"
            loading={loading}
            onClick={() => setModalType('ready_for_pickup')}
          />
        </AnimatedContainer>
      </div>

      {/* Estatísticas */}
      <div className="px-4 max-w-5xl mx-auto mt-8 mb-6">
        <AnimatedContainer type="slideUp" delay={0.1}>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">
              Estatísticas
            </h2>

            {/* Mini Cards de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Tempo Médio"
                value={`${metrics.averageWaitTime}d`}
                subtitle="de espera"
                icon="fa-solid fa-hourglass-half"
                colorScheme="purple"
                loading={loading}
              />

              <MetricCard
                title="Total Ativos"
                value={
                  metrics.totalActive +
                  metrics.totalAwaitingTransfer +
                  metrics.totalReadyForPickup
                }
                subtitle="clientes"
                icon="fa-solid fa-users"
                colorScheme="blue"
                loading={loading}
              />

              <MetricCard
                title="Taxa Conversão"
                value={`${
                  metrics.totalFinished > 0
                    ? Math.round(
                        (metrics.totalFinished /
                          (metrics.totalActive +
                            metrics.totalAwaitingTransfer +
                            metrics.totalReadyForPickup +
                            metrics.totalFinished)) *
                          100
                      )
                    : 0
                }%`}
                subtitle="vendidos"
                icon="fa-solid fa-chart-line"
                colorScheme="cyan"
                loading={loading}
              />

              <MetricCard
                title="Vendas"
                value={metrics.totalFinished}
                subtitle="finalizadas"
                icon="fa-solid fa-circle-check"
                colorScheme="emerald"
                loading={loading}
              />
            </div>

            {/* Gráfico de Top Produtos */}
            <div>
              <TopProductsChart />
            </div>
          </div>
        </AnimatedContainer>
      </div>

      {/* Modal de Lista de Clientes */}
      <CustomerListModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={getModalTitle()}
        customers={customers}
        loading={customersLoading}
        onWhatsApp={handleWhatsApp}
        onArchive={handleArchive}
        onCheckLojaCampinas={handleCheckStoreCampinas}
        onCheckLojaDomPedro={handleCheckStoreDomPedro}
        onProductArrived={handleProductArrived}
        onPurchaseCompleted={handleCompleteOrder}
        onStoreHasStock={handleConfirmStoreStock}
        onStoreNoStock={handleRejectStoreStock}
        onClientAccepted={handleAcceptTransfer}
        onClientDeclined={handleDeclineTransfer}
      />

      {/* Modal de Arquivamento */}
      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchiveCustomer}
        customerName={customerToArchive?.name || ''}
      />
    </PageLayout>
  );
}

export default Dashboard;
