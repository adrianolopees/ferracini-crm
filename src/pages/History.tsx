import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import { Input, PageLayout, Tabs } from '@/components/ui';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { ConfirmModal, ArchiveModal } from '@/components/modals';
import { TransferCard, ArchivedCard, FinalizedCard, LongWaitCard } from '@/components/history';
import { AnimatePresence } from 'framer-motion';
import {
  restoreFromArchive,
  moveToReadyForPickup,
  archiveCustomer,
  deleteCustomer,
} from '@/services/customerActionService';
import { useDashboardData } from '@/hooks';
import { sendGenericMessage } from '@/services/whatsappService';

type TabType = 'finalized' | 'transfers' | 'archived' | 'long_wait';

type FilterButtonProps = {
  label: string;
  icon: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  colorScheme: {
    active: string;
    inactive: string;
    icon: string;
    text: string;
  };
};

function FilterButton({ label, icon, count, isActive, onClick, colorScheme }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 sm:p-2.5 border shadow-sm transition-all cursor-pointer ${
        isActive
          ? `${colorScheme.active} shadow-md scale-105`
          : `bg-white ${colorScheme.inactive} hover:border-${colorScheme.text.split('-')[1]}-400`
      }`}
    >
      <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
        <i className={`${icon} text-xs ${isActive ? 'text-white' : colorScheme.icon}`}></i>
        <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-600'}`}>{label}</span>
      </div>
      <div
        className={`text-lg sm:text-xl font-bold text-center sm:text-left ${isActive ? 'text-white' : colorScheme.text}`}
      >
        {count}
      </div>
    </button>
  );
}

function History() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'transfers');
  const [searchTerm, setSearchTerm] = useState('');
  const [transferFilter, setTransferFilter] = useState<'all' | 'Campinas' | 'Dom Pedro'>('all');

  // Modais de arquivamento e delete
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const { longWaitCustomers, finalizedCustomers, archivedCustomers, customersByStatus, refresh, loading } =
    useDashboardData();
  const transferCustomers = customersByStatus.awaiting_transfer;
  // Buscar clientes ao carregar
  useEffect(() => {
    refresh();
  }, []);

  // Limpar busca ao trocar de tab
  useEffect(() => {
    setSearchTerm('');
    setTransferFilter('all');
  }, [activeTab]);

  const filteredCustomers = useMemo(() => {
    // Selecionar a lista base
    const customersByTab: Record<TabType, Customer[]> = {
      finalized: finalizedCustomers,
      transfers: transferCustomers,
      archived: archivedCustomers,
      long_wait: longWaitCustomers,
    };
    let customers = customersByTab[activeTab] || [];

    // Aplicar filtro de transferências
    if (activeTab === 'transfers' && transferFilter !== 'all') {
      customers = customers.filter((customer) => customer.sourceStore === transferFilter);
    }

    // Aplicar busca
    if (searchTerm.trim() === '') {
      return customers;
    }

    // Filtrar por termo de busca
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.model.toLowerCase().includes(term) ||
        customer.reference.toLowerCase().includes(term) ||
        customer.phone.includes(term)
    );
  }, [
    searchTerm,
    activeTab,
    finalizedCustomers,
    transferCustomers,
    archivedCustomers,
    longWaitCustomers,
    transferFilter,
  ]);

  const handleRestore = async (customer: Customer) => {
    try {
      await restoreFromArchive(customer);
      toast.success(`${customer.name} restaurado para clientes ativos!`);
      refresh();
    } catch (error) {
      console.error('Erro ao restaurar cliente:', error);
      toast.error('Erro ao restaurar cliente');
    }
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer(customerToDelete);
      toast.success(`${customerToDelete.name} excluído permanentemente!`);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      refresh();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleContact = (customer: Customer) => {
    sendGenericMessage(customer);
    toast.success(`WhatsApp aberto para ${customer.name}`);
  };

  const handleReadyForPickup = async (customer: Customer) => {
    try {
      await moveToReadyForPickup(customer);
      toast.success(`${customer.name} movido para Pronto para Retirada!`);
      refresh();
    } catch (error) {
      console.error('Erro ao mover cliente:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };

  // Handler para arquivar clientes de long_wait
  const handleArchiveFromLongWait = (customer: Customer) => {
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  // Handler para confirmar arquivamento
  const handleConfirmArchive = async (reason: ArchiveReason, notes?: string) => {
    if (!customerToArchive) return;

    try {
      await archiveCustomer(customerToArchive, reason, notes || '');
      toast.success(`${customerToArchive.name} arquivado com sucesso!`);
      setArchiveModalOpen(false);
      setCustomerToArchive(null);
      refresh();
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      toast.error('Erro ao arquivar cliente');
    }
  };

  const tabs = [
    {
      id: 'transfers',
      label: 'Transferidos',
      count: transferCustomers.length,
      icon: 'fa-solid fa-truck-fast',
    },
    {
      id: 'finalized',
      label: 'Finalizados',
      count: finalizedCustomers.length,
      icon: 'fa-solid fa-circle-check',
    },
    {
      id: 'long_wait',
      label: '30+ dias',
      count: longWaitCustomers.length,
      icon: 'fa-solid fa-clock',
    },
    {
      id: 'archived',
      label: 'Arquivados',
      count: archivedCustomers.length,
      icon: 'fa-solid fa-archive',
    },
  ];

  const filterButtons = [
    {
      value: 'all' as const,
      label: 'Total',
      icon: 'fa-solid fa-chart-line',
      count: transferCustomers.length,
      colorScheme: {
        active: 'bg-emerald-500 border-emerald-600',
        inactive: 'border-emerald-200',
        icon: 'text-emerald-500',
        text: 'text-emerald-600',
      },
    },
    {
      value: 'Campinas' as const,
      label: 'Campinas',
      icon: 'fa-solid fa-store',
      count: transferCustomers.filter((c) => c.sourceStore === 'Campinas').length,
      colorScheme: {
        active: 'bg-blue-500 border-blue-600',
        inactive: 'border-blue-200',
        icon: 'text-blue-500',
        text: 'text-blue-600',
      },
    },
    {
      value: 'Dom Pedro' as const,
      label: 'Dom Pedro',
      icon: 'fa-solid fa-store',
      count: transferCustomers.filter((c) => c.sourceStore === 'Dom Pedro').length,
      colorScheme: {
        active: 'bg-purple-500 border-purple-600',
        inactive: 'border-purple-200',
        icon: 'text-purple-500',
        text: 'text-purple-600',
      },
    },
  ];

  const emptyStateConfig: Record<TabType, { icon: string; message: string }> = {
    finalized: {
      icon: 'fa-solid fa-circle-check',
      message: 'Nenhuma venda finalizada ainda',
    },
    transfers: {
      icon: 'fa-solid fa-arrows-turn-right',
      message: 'Nenhuma transferência recebida ainda',
    },
    long_wait: {
      icon: 'fa-solid fa-clock',
      message: 'Nenhum cliente aguardando há mais de 30 dias',
    },
    archived: {
      icon: 'fa-solid fa-archive',
      message: 'Nenhum cliente arquivado',
    },
  };

  return (
    <PageLayout
      title="Histórico de"
      highlight="Clientes"
      subtitle="Vendas finalizadas, transferências recebidas e clientes arquivados"
      maxWidth="2xl"
    >
      {/* Tabs e Conteúdo */}
      <AnimatedContainer type="slideUp" delay={0.2}>
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as TabType)}>
            {/* Busca */}
            <div className="mb-4 sm:mb-6">
              <Input
                type="search"
                placeholder="Digite nome, modelo, referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Resumo de Transferências com Filtros */}
            {activeTab === 'transfers' && transferCustomers.length > 0 && (
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-solid fa-filter text-blue-600 text-sm"></i>
                  <h3 className="text-sm font-semibold text-gray-800">Filtros de Transferências</h3>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {filterButtons.map((filter) => (
                    <FilterButton
                      key={filter.value}
                      {...filter}
                      isActive={transferFilter === filter.value}
                      onClick={() => setTransferFilter(filter.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Lista de clientes */}
            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-4">Carregando...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <i className={`text-gray-400 text-2xl ${emptyStateConfig[activeTab].icon}`}></i>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {searchTerm ? 'Nenhum resultado encontrado' : emptyStateConfig[activeTab].message}
                  </p>
                  {searchTerm && <p className="text-gray-500 text-sm mt-1">Tente outro termo de busca</p>}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredCustomers.map((customer, index) => {
                    const isArchivedTab = activeTab === 'archived';
                    const isTransferTab = activeTab === 'transfers';
                    const isLongWaitTab = activeTab === 'long_wait';

                    return (
                      <AnimatedListItem key={`${activeTab}-${customer.id}`} index={index}>
                        {isTransferTab ? (
                          <TransferCard customer={customer} />
                        ) : isArchivedTab ? (
                          <ArchivedCard customer={customer} onRestore={handleRestore} onDelete={handleDelete} />
                        ) : isLongWaitTab ? (
                          <LongWaitCard
                            customer={customer}
                            onContact={handleContact}
                            onReadyForPickup={handleReadyForPickup}
                            onArchive={handleArchiveFromLongWait}
                          />
                        ) : (
                          <FinalizedCard customer={customer} />
                        )}
                      </AnimatedListItem>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </Tabs>
        </div>
      </AnimatedContainer>
      {/* Modal de Arquivamento */}
      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
        customerName={customerToArchive?.name || ''}
      />

      {/* Modal de Delete Permanente */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        customerName={customerToDelete?.name || ''}
      />
    </PageLayout>
  );
}

export default History;
