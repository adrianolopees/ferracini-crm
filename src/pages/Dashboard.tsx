import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageLayout } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { ActionCard, MetricCard, LongWaitAlert, TopProductsChart } from '@/components/dashboard';
import { ArchiveModal, CustomerListModal } from '@/components/modals';
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import {
  notifyOtherStore,
  notifyProductArrived,
  sendGenericMessage,
  sendStoreCampinas,
  sendStoreDomPedro,
} from '@/services/whatsappService';
import { useCustomerDashboard } from '@/hooks';
import { updateCustomer } from '@/repositories';
import { getCurrentTimestamp } from '@/utils';

function Dashboard() {
  const navigate = useNavigate();
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);
  const [modalType, setModalType] = useState<'awaiting' | 'awaitingTransfer' | 'readyForPickup' | null>(null);
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<string | null>(null);
  const { metrics, lists, loading, refresh } = useCustomerDashboard();

  const executeAction = async (action: () => Promise<void>, successMessage: string, customerId: string) => {
    try {
      await action();
      toast.success(successMessage);
      setHighlightedCustomerId(customerId);
      refresh();
      setTimeout(() => setHighlightedCustomerId(null), 5000);
    } catch (error) {
      console.error('Erro na operação:', error);
      toast.error('Erro ao processar ação');
    }
  };

  const getCustomersByModalType = () => {
    if (!modalType) return [];
    const mapping = {
      awaiting: lists.awaiting,
      awaitingTransfer: lists.awaitingTransfer,
      readyForPickup: lists.readyForPickup,
    };
    return mapping[modalType];
  };

  const customers = getCustomersByModalType();

  const handleCheckStoreCampinas = (customer: Customer) => {
    executeAction(
      async () => {
        await updateCustomer(customer.id, { consultingStore: 'Campinas' });
        sendStoreCampinas(customer);
      },
      'WhatsApp enviado para Loja Campinas',
      customer.id
    );
  };

  const handleCheckStoreDomPedro = (customer: Customer) => {
    executeAction(
      async () => {
        await updateCustomer(customer.id, { consultingStore: 'Dom Pedro' });
        sendStoreDomPedro(customer);
      },
      'WhatsApp enviado para Loja Dom Pedro',
      customer.id
    );
  };

  const handleConfirmStoreStock = (customer: Customer) =>
    executeAction(
      async () => {
        await updateCustomer(customer.id, { storeHasStock: true });
        notifyOtherStore(customer);
      },
      'Cliente notificado sobre disponibilidade',
      customer.id
    );

  const handleRejectStoreStock = (customer: Customer) =>
    executeAction(
      () =>
        updateCustomer(customer.id, {
          consultingStore: undefined,
          storeHasStock: false,
        }),
      'Produto não disponível. Pode consultar outra loja.',
      customer.id
    );

  const handleAcceptTransfer = (customer: Customer) =>
    executeAction(
      () =>
        updateCustomer(customer.id, {
          status: 'awaitingTransfer',
          sourceStore: customer.consultingStore!,
          transferredAt: getCurrentTimestamp(),
          consultingStore: undefined,
          storeHasStock: false,
        }),
      `Transferência confirmada de ${customer.consultingStore}!`,
      customer.id
    );

  const handleDeclineTransfer = (customer: Customer) => {
    setModalType(null);
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  const handleArchiveCustomer = async (reason: ArchiveReason, notes?: string) => {
    if (!customerToArchive) return;

    try {
      await updateCustomer(customerToArchive.id, {
        consultingStore: undefined,
        storeHasStock: false,
        archived: true,
        archiveReason: reason,
        archivedAt: getCurrentTimestamp(),
        notes: notes || '',
      });
      toast.success(`${customerToArchive.name} arquivado com sucesso!`);
      setArchiveModalOpen(false);
      setCustomerToArchive(null);
      refresh();
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      toast.error('Erro ao arquivar cliente');
    }
  };

  const handleProductArrived = (customer: Customer) =>
    executeAction(
      async () => {
        await updateCustomer(customer.id, {
          status: 'readyForPickup',
          contactedAt: getCurrentTimestamp(),
        });
        notifyProductArrived(customer);
      },
      'Cliente notificado - produto chegou!',
      customer.id
    );

  const handleCompleteOrder = (customer: Customer) =>
    executeAction(
      () =>
        updateCustomer(customer.id, {
          status: 'completed',
          completedAt: getCurrentTimestamp(),
        }),
      `Venda de ${customer.name} finalizada!`,
      customer.id
    );

  const handleArchive = (customer: Customer) => {
    setModalType(null);
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  const handleResetToInitial = (customer: Customer) =>
    executeAction(
      () =>
        updateCustomer(customer.id, {
          consultingStore: undefined,
          storeHasStock: false,
          status: 'pending',
          sourceStore: undefined,
          transferredAt: undefined,
          contactedAt: undefined,
        }),
      `Cliente ${customer.name} voltou ao status inicial.`,
      customer.id
    );

  const handleViewLongWait = () => {
    navigate('/history?tab=long_wait');
  };

  const getModalTitle = () => {
    if (modalType === 'awaiting') return `Clientes Aguardando (${metrics.totalActive})`;
    if (modalType === 'awaitingTransfer') return `Aguardando Transferência (${metrics.totalAwaitingTransfer})`;
    if (modalType === 'readyForPickup') return `Pronto para Retirada (${metrics.totalReadyForPickup})`;
    return '';
  };

  return (
    <PageLayout
      title="Painel de"
      highlight="Controle"
      subtitle="Sistema para gerenciar solicitações de clientes, transferências entre lojas e reposições de estoque"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
        {/* Card 1: Clientes Aguardando */}
        <AnimatedContainer type="slideDown" delay={0.1}>
          <ActionCard
            title="Aguardando"
            value={metrics.totalActive}
            subtitle={metrics.urgentCount > 0 ? `${metrics.urgentCount} urgente(s)` : 'Clientes na fila de espera'}
            icon="fa-solid fa-clock"
            colorScheme="blue"
            loading={loading}
            onClick={() => setModalType('awaiting')}
          />
        </AnimatedContainer>

        {/* Card 2: Aguardando Transferência */}
        <AnimatedContainer type="slideDown" delay={0.2}>
          <ActionCard
            title="Em Transferência"
            value={metrics.totalAwaitingTransfer}
            subtitle="Aguardando transferência"
            icon="fa-solid fa-truck"
            colorScheme="yellow"
            loading={loading}
            onClick={() => setModalType('awaitingTransfer')}
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
            onClick={() => setModalType('readyForPickup')}
          />
        </AnimatedContainer>
      </div>

      {/* Banner de Espera Longa */}
      <div className="px-4 max-w-5xl mx-auto mt-6">
        <LongWaitAlert count={metrics.longWaitCount} loading={loading} onClick={handleViewLongWait} />
      </div>

      {/* Estatísticas */}
      <div className="px-4 max-w-5xl mx-auto mt-8 mb-6">
        <AnimatedContainer type="slideUp" delay={0.1}>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Estatísticas</h2>

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
                value={metrics.totalActive + metrics.totalAwaitingTransfer + metrics.totalReadyForPickup}
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
        loading={loading}
        highlightedCustomerId={highlightedCustomerId}
        onSendMessage={sendGenericMessage}
        onArchive={handleArchive}
        onResetToInitial={handleResetToInitial}
        checkStoreCampinas={handleCheckStoreCampinas}
        checkStoreDomPedro={handleCheckStoreDomPedro}
        productArrived={handleProductArrived}
        completeOrder={handleCompleteOrder}
        confirmStoreStock={handleConfirmStoreStock}
        rejectStoreStock={handleRejectStoreStock}
        acceptTransfer={handleAcceptTransfer}
        declineTransfer={handleDeclineTransfer}
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
