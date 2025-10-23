import { useState } from 'react';
import { ArchiveModal, PageLayout } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { useDashboardMetrics } from '@/hooks';
import { useCustomersList } from '@/hooks';
import {
  CustomerListModal,
  ActionCard,
  MetricCard,
} from '@/components/features';
import { Customer, ArchiveReason } from '@/types/customer';
import { updateDoc, doc } from 'firebase/firestore';
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
  // Estado para forçar atualização das métricas do dashboard
  const [metricsRefreshTrigger, setMetricsRefreshTrigger] = useState(0);

  const { metrics, loading } = useDashboardMetrics({
    refreshTrigger: metricsRefreshTrigger,
  });

  // Estado para controlar qual modal está aberto
  const [modalType, setModalType] = useState<
    'awaiting' | 'awaiting_transfer' | 'contacted' | null
  >(null);

  // Estado para controlar modal de arquivamento
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(
    null
  );

  // Estado para forçar atualização da lista de clientes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Função para atualizar as métricas do dashboard
  const refreshMetrics = () => {
    setMetricsRefreshTrigger((prev) => prev + 1);
  };

  // Função para atualizar a lista sem recarregar a página
  const refreshCustomers = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Função para atualizar tudo (lista + métricas)
  const refreshAll = () => {
    refreshCustomers();
    refreshMetrics();
  };

  // Determinar filterType baseado no modal ativo
  const getFilterType = () => {
    if (modalType === 'awaiting') return 'all';
    if (modalType === 'contacted') return 'contacted';
    if (modalType === 'awaiting_transfer') return 'awaiting_transfer';
    return 'all';
  };

  // Hook para buscar clientes filtrados
  const { customers, loading: customersLoading } = useCustomersList({
    filterType: getFilterType(),
    isOpen: modalType !== null,
    refreshTrigger,
  });

  // Função para avisar cliente que tem em outra loja
  const handleWhatsApp = (customer: Customer) => {
    notifyOtherStore(customer);
  };

  // Função para verificar disponibilidade na Loja Campinas
  const handleCheckLojaCampinas = async (customer: Customer) => {
    try {
      await updateDoc(doc(db, 'clientes', customer.id), {
        consultandoLoja: 'Campinas',
      });
      checkLojaCampinas(customer);
      toast('WhatsApp enviado para Loja Campinas');
      refreshCustomers();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao consultar loja');
    }
  };

  // Função para verificar disponibilidade na Loja Dom Pedro
  const handleCheckLojaDomPedro = async (customer: Customer) => {
    try {
      await updateDoc(doc(db, 'clientes', customer.id), {
        consultandoLoja: 'Dom Pedro',
      });
      checkLojaDomPedro(customer); // Envia WhatsApp para loja
      toast('WhatsApp enviado para Loja Dom Pedro');
      refreshCustomers(); // Atualiza lista sem recarregar
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao consultar loja');
    }
  };

  // Função quando LOJA confirma que TEM estoque
  const handleStoreHasStock = async (customer: Customer) => {
    try {
      await updateDoc(doc(db, 'clientes', customer.id), {
        lojaTemEstoque: true,
      });
      // Envia WhatsApp para o CLIENTE perguntando se aceita transferência
      notifyOtherStore(customer);
      toast.success(
        `Cliente notificado sobre disponibilidade em ${customer.consultandoLoja}!`
      );
      refreshCustomers(); // Atualiza lista sem recarregar
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao notificar cliente');
    }
  };

  // Função quando LOJA confirma que NÃO TEM estoque
  const handleStoreNoStock = async (customer: Customer) => {
    try {
      await updateDoc(doc(db, 'clientes', customer.id), {
        consultandoLoja: null,
        lojaTemEstoque: false,
      });
      toast('Produto não disponível. Pode consultar outra loja.');
      refreshCustomers(); // Atualiza lista sem recarregar
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Função quando CLIENTE aceita a transferência
  const handleClientAccepted = async (customer: Customer) => {
    try {
      await moveToAwaitingTransfer(customer, customer.consultandoLoja!);
      // Limpa campos auxiliares
      await updateDoc(doc(db, 'clientes', customer.id), {
        consultandoLoja: null,
        lojaTemEstoque: false,
      });
      toast.success(`Transferência confirmada de ${customer.consultandoLoja}!`);
      refreshAll(); // Atualiza lista e métricas
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao confirmar transferência');
    }
  };

  // Função quando CLIENTE recusa a transferência
  const handleClientDeclined = (customer: Customer) => {
    setModalType(null); // Fecha o modal de lista
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  // Função para abrir modal de arquivamento
  const handleDelete = (customer: Customer) => {
    setModalType(null); // Fecha o modal de lista primeiro
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  // Função para arquivar cliente
  const handleArchiveCustomer = async (
    reason: ArchiveReason,
    notes?: string
  ) => {
    if (!customerToArchive) return;

    try {
      await updateDoc(doc(db, 'clientes', customerToArchive.id), {
        arquivado: true,
        motivoArquivamento: reason,
        dataArquivamento: new Date().toISOString(),
        observacoes: notes,
      });

      toast.success(`${customerToArchive.cliente} arquivado com sucesso!`);
      setArchiveModalOpen(false);
      setCustomerToArchive(null);
      refreshAll(); // Atualiza lista e métricas
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      toast.error('Erro ao arquivar cliente');
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
      refreshAll(); // Atualiza lista e métricas
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
      toast.success(`${customer.cliente} pronto para retirada!`);
      refreshAll(); // Atualiza lista e métricas
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
    if (modalType === 'contacted') return 'Pronto para Retirada';
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
            value={metrics.totalContacted}
            subtitle={
              metrics.totalFinished > 0
                ? `${metrics.totalFinished} venda(s) finalizada(s)`
                : 'Produtos disponíveis para o cliente'
            }
            icon="fa-solid fa-box-open"
            colorScheme="green"
            loading={loading}
            onClick={() => setModalType('contacted')}
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
                  metrics.totalContacted
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
                            metrics.totalContacted +
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
        onDelete={handleDelete}
        onCheckLojaCampinas={handleCheckLojaCampinas}
        onCheckLojaDomPedro={handleCheckLojaDomPedro}
        onAcceptTransfer={handleAcceptTransfer}
        onProductArrived={handleProductArrived}
        onPurchaseCompleted={handlePurchaseCompleted}
        onStoreHasStock={handleStoreHasStock}
        onStoreNoStock={handleStoreNoStock}
        onClientAccepted={handleClientAccepted}
        onClientDeclined={handleClientDeclined}
      />

      {/* Modal de Arquivamento */}
      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchiveCustomer}
        customerName={customerToArchive?.cliente || ''}
      />
    </PageLayout>
  );
}

export default Dashboard;
