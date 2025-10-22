import { useState } from 'react';
import { Navigation, PageHeader, ArchiveModal } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';
import { useDashboardMetrics } from '@/hooks';
import { useCustomersList } from '@/hooks';
import { CustomerListModal } from '@/components/features';
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

  // Estado para controlar tabs dentro dos modais
  const [awaitingTab, setAwaitingTab] = useState<'all' | 'urgent'>('all');
  const [contactedTab, setContactedTab] = useState<'all' | 'finished'>('all');

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

  // Determinar filterType baseado no modal e tab ativos
  const getFilterType = () => {
    if (modalType === 'awaiting') {
      return awaitingTab === 'urgent' ? 'urgent' : 'all';
    }
    if (modalType === 'contacted') {
      return contactedTab === 'finished' ? 'finished' : 'contacted';
    }
    if (modalType === 'awaiting_transfer') {
      return 'awaiting_transfer';
    }
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
      toast.success(
        `Transferência confirmada de ${customer.consultandoLoja}!`
      );
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

  // Funções para gerenciar tabs dos modais
  const handleAwaitingTabChange = (tabId: string) => {
    setAwaitingTab(tabId as 'all' | 'urgent');
  };

  const handleContactedTabChange = (tabId: string) => {
    setContactedTab(tabId as 'all' | 'finished');
  };

  // Definir tabs para cada modal
  const awaitingTabs = [
    {
      id: 'all',
      label: 'Todos',
      count: metrics.totalActive,
      icon: 'fa-solid fa-users',
    },
    {
      id: 'urgent',
      label: 'Urgentes',
      count: metrics.urgentCustomers,
      icon: 'fa-solid fa-triangle-exclamation',
    },
  ];

  const contactedTabs = [
    {
      id: 'all',
      label: 'Disponíveis',
      count: metrics.totalContacted,
      icon: 'fa-solid fa-box-open',
    },
    {
      id: 'finished',
      label: 'Finalizados',
      count: metrics.totalFinished,
      icon: 'fa-solid fa-circle-check',
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 max-w-5xl mx-auto">
          {/* Card 1: Clientes Aguardando */}
          <AnimatedContainer type="slideDown" delay={0.1}>
            <div
              onClick={() => setModalType('awaiting')}
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
                {metrics.urgentCustomers > 0
                  ? `${metrics.urgentCustomers} urgente(s)`
                  : 'Clientes na fila de espera'}
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

          {/* Card 3: Pronto para Retirada */}
          <AnimatedContainer type="slideDown" delay={0.3}>
            <div
              onClick={() => setModalType('contacted')}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Pronto para Retirada
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
                  <i className="fa-solid fa-box-open text-2xl text-green-600"></i>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {metrics.totalFinished > 0
                  ? `${metrics.totalFinished} venda(s) finalizada(s)`
                  : 'Produtos disponíveis para o cliente'}
              </p>
            </div>
          </AnimatedContainer>

          {/* Card 4: Tempo Médio (apenas visual) */}
          <AnimatedContainer type="slideDown" delay={0.4}>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
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
        <div className="px-4 max-w-5xl mx-auto pb-8">
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
          onStoreHasStock={handleStoreHasStock}
          onStoreNoStock={handleStoreNoStock}
          onClientAccepted={handleClientAccepted}
          onClientDeclined={handleClientDeclined}
          tabs={
            modalType === 'awaiting'
              ? awaitingTabs
              : modalType === 'contacted'
                ? contactedTabs
                : undefined
          }
          activeTab={
            modalType === 'awaiting'
              ? awaitingTab
              : modalType === 'contacted'
                ? contactedTab
                : undefined
          }
          onTabChange={
            modalType === 'awaiting'
              ? handleAwaitingTabChange
              : modalType === 'contacted'
                ? handleContactedTabChange
                : undefined
          }
        />

        {/* Modal de Arquivamento */}
        <ArchiveModal
          isOpen={archiveModalOpen}
          onClose={() => setArchiveModalOpen(false)}
          onConfirm={handleArchiveCustomer}
          customerName={customerToArchive?.cliente || ''}
        />
      </main>
    </div>
  );
}

export default Dashboard;
