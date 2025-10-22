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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        {/* Header */}
        <AnimatedContainer type="slideDown">
          <PageHeader
            title="Gestão de"
            highlight="Clientes"
            subtitle="Gerencie o fluxo de clientes em tempo real"
          />
        </AnimatedContainer>

        {/* Ações Rápidas */}
        <div className="px-4 max-w-5xl mx-auto mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Ações Rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
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
                {/* Tempo Médio */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-hourglass-half text-purple-600"></i>
                    <p className="text-xs font-medium text-purple-700">
                      Tempo Médio
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-purple-500 text-2xl"></i>
                    ) : (
                      `${metrics.averageWaitTime}d`
                    )}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">de espera</p>
                </div>

                {/* Total Ativos */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-users text-blue-600"></i>
                    <p className="text-xs font-medium text-blue-700">
                      Total Ativos
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-blue-500 text-2xl"></i>
                    ) : (
                      metrics.totalActive +
                      metrics.totalAwaitingTransfer +
                      metrics.totalContacted
                    )}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">clientes</p>
                </div>

                {/* Taxa de Conversão */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-chart-line text-green-600"></i>
                    <p className="text-xs font-medium text-green-700">
                      Taxa Conversão
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-green-500 text-2xl"></i>
                    ) : (
                      `${
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
                      }%`
                    )}
                  </p>
                  <p className="text-xs text-green-600 mt-1">finalizadas</p>
                </div>

                {/* Vendas Finalizadas */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    <p className="text-xs font-medium text-emerald-700">
                      Vendas
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900">
                    {loading ? (
                      <i className="fa-solid fa-spinner fa-spin text-emerald-500 text-2xl"></i>
                    ) : (
                      metrics.totalFinished
                    )}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">finalizadas</p>
                </div>
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
      </main>
    </div>
  );
}

export default Dashboard;
