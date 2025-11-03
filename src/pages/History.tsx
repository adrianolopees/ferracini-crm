import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';
import { Customer } from '@/types/customer';
import { Input, PageLayout, Tabs, ConfirmModal } from '@/components/ui';
import {
  AnimatedContainer,
  AnimatedListItem,
} from '@/components/animations';
import { AnimatePresence } from 'framer-motion';
import {
  TransferCard,
  ArchivedCard,
  FinalizedCard,
} from '@/components/features';
import { useCustomerActions } from '@/hooks';

type TabType = 'finalized' | 'transfers' | 'archived';

function History() {
  const [activeTab, setActiveTab] = useState<TabType>('finalized');
  const [searchTerm, setSearchTerm] = useState('');
  const [finalizedCustomers, setFinalizedCustomers] = useState<Customer[]>([]);
  const [transferCustomers, setTransferCustomers] = useState<Customer[]>([]);
  const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [transferFilter, setTransferFilter] = useState<
    'all' | 'Campinas' | 'Dom Pedro' | 'not_finalized'
  >('all');
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  const { restoreFromArchive } = useCustomerActions();

  // Buscar clientes ao carregar
  useEffect(() => {
    fetchAllCustomers();
  }, []);

  // Limpar busca ao trocar de tab
  useEffect(() => {
    setSearchTerm('');
    setTransferFilter('all');
  }, [activeTab]);

  // Filtrar quando mudar busca ou listas
  useEffect(() => {
    let customers =
      activeTab === 'finalized'
        ? finalizedCustomers
        : activeTab === 'transfers'
          ? transferCustomers
          : archivedCustomers;

    customers =
      activeTab === 'transfers' && transferFilter !== 'all'
        ? transferFilter === 'Campinas'
          ? customers.filter((c) => c.sourceStore === 'Campinas')
          : transferFilter === 'Dom Pedro'
            ? customers.filter((c) => c.sourceStore === 'Dom Pedro')
            : transferFilter === 'not_finalized'
              ? customers.filter((c) => c.archived)
              : customers
        : customers;

    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.model.toLowerCase().includes(term) ||
          customer.reference.toLowerCase().includes(term) ||
          customer.phone.includes(term)
      );
      setFilteredCustomers(filtered);
    }
  }, [
    searchTerm,
    activeTab,
    finalizedCustomers,
    transferCustomers,
    archivedCustomers,
    transferFilter,
  ]);

  const fetchAllCustomers = async () => {
    try {
      setLoading(true);

      const finalized: Customer[] = [];
      const transfers: Customer[] = [];
      const archived: Customer[] = [];

      const snapshot = await getDocs(collection(db, 'customers'));

      snapshot.forEach((doc) => {
        const customerData = doc.data();

        if (customerData.archived) {
          if (customerData.status !== 'completed') {
            archived.push({ id: doc.id, ...customerData } as Customer);
          }
        } else if (customerData.status === 'completed') {
          finalized.push({ id: doc.id, ...customerData } as Customer);
        }
        if (
          customerData.sourceStore === 'Campinas' ||
          customerData.sourceStore === 'Dom Pedro'
        ) {
          transfers.push({ id: doc.id, ...customerData } as Customer);
        }
      });

      setFinalizedCustomers(finalized);
      setTransferCustomers(transfers);
      setArchivedCustomers(archived);
      setFilteredCustomers(finalized); // Por padrão mostra finalizados
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (customer: Customer) => {
    try {
      await restoreFromArchive(customer);
      toast.success(`${customer.name} restaurado para clientes ativos!`);
      fetchAllCustomers();
    } catch (error) {
      console.error('Erro ao restaurar cliente:', error);
      toast.error('Erro ao restaurar cliente');
    }
  };

  const handleDelete = async (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteDoc(doc(db, 'customers', customerToDelete.id));
      toast.success(`${customerToDelete.name} excluído permanentemente!`);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      fetchAllCustomers(); // Recarregar listas
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const tabs = [
    {
      id: 'finalized',
      label: 'Finalizados',
      count: finalizedCustomers.length,
      icon: 'fa-solid fa-circle-check',
    },
    {
      id: 'transfers',
      label: 'Transferências',
      count: transferCustomers.length,
      icon: 'fa-solid fa-arrows-turn-right',
    },
    {
      id: 'archived',
      label: 'Arquivados',
      count: archivedCustomers.length,
      icon: 'fa-solid fa-archive',
    },
  ];

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
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          >
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
                  <h3 className="text-sm font-semibold text-gray-800">
                    Filtros de Transferências
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {/* Não Finalizados */}
                  <button
                    onClick={() => setTransferFilter('not_finalized')}
                    className={`rounded-lg p-2 sm:p-2.5 border shadow-sm transition-all cursor-pointer ${
                      transferFilter === 'not_finalized'
                        ? 'bg-orange-500 border-orange-600 shadow-md scale-105'
                        : 'bg-white border-orange-200 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                      <i
                        className={`fa-solid fa-box-archive text-xs ${
                          transferFilter === 'not_finalized'
                            ? 'text-white'
                            : 'text-orange-500'
                        }`}
                      ></i>
                      <span
                        className={`text-xs font-medium truncate ${
                          transferFilter === 'not_finalized'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        Não Finalizados
                      </span>
                    </div>
                    <div
                      className={`text-lg sm:text-xl font-bold text-center sm:text-left ${
                        transferFilter === 'not_finalized'
                          ? 'text-white'
                          : 'text-orange-600'
                      }`}
                    >
                      {transferCustomers.filter((c) => c.archived).length}
                    </div>
                  </button>

                  {/* Campinas */}
                  <button
                    onClick={() => setTransferFilter('Campinas')}
                    className={`rounded-lg p-2 sm:p-2.5 border shadow-sm transition-all cursor-pointer ${
                      transferFilter === 'Campinas'
                        ? 'bg-blue-500 border-blue-600 shadow-md scale-105'
                        : 'bg-white border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                      <i
                        className={`fa-solid fa-store text-xs ${
                          transferFilter === 'Campinas'
                            ? 'text-white'
                            : 'text-blue-500'
                        }`}
                      ></i>
                      <span
                        className={`text-xs font-medium truncate ${
                          transferFilter === 'Campinas'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        Campinas
                      </span>
                    </div>
                    <div
                      className={`text-lg sm:text-xl font-bold text-center sm:text-left ${
                        transferFilter === 'Campinas'
                          ? 'text-white'
                          : 'text-blue-600'
                      }`}
                    >
                      {
                        transferCustomers.filter(
                          (c) => c.sourceStore === 'Campinas'
                        ).length
                      }
                    </div>
                  </button>

                  {/* Dom Pedro */}
                  <button
                    onClick={() => setTransferFilter('Dom Pedro')}
                    className={`rounded-lg p-2 sm:p-2.5 border shadow-sm transition-all cursor-pointer ${
                      transferFilter === 'Dom Pedro'
                        ? 'bg-purple-500 border-purple-600 shadow-md scale-105'
                        : 'bg-white border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                      <i
                        className={`fa-solid fa-store text-xs ${
                          transferFilter === 'Dom Pedro'
                            ? 'text-white'
                            : 'text-purple-500'
                        }`}
                      ></i>
                      <span
                        className={`text-xs font-medium truncate ${
                          transferFilter === 'Dom Pedro'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        Dom Pedro
                      </span>
                    </div>
                    <div
                      className={`text-lg sm:text-xl font-bold text-center sm:text-left ${
                        transferFilter === 'Dom Pedro'
                          ? 'text-white'
                          : 'text-purple-600'
                      }`}
                    >
                      {
                        transferCustomers.filter(
                          (c) => c.sourceStore === 'Dom Pedro'
                        ).length
                      }
                    </div>
                  </button>

                  {/* Total */}
                  <button
                    onClick={() => setTransferFilter('all')}
                    className={`rounded-lg p-2 sm:p-2.5 border shadow-sm transition-all cursor-pointer ${
                      transferFilter === 'all'
                        ? 'bg-emerald-500 border-emerald-600 shadow-md scale-105'
                        : 'bg-white border-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                      <i
                        className={`fa-solid fa-chart-line text-xs ${
                          transferFilter === 'all'
                            ? 'text-white'
                            : 'text-emerald-500'
                        }`}
                      ></i>
                      <span
                        className={`text-xs font-medium truncate ${
                          transferFilter === 'all'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        Total
                      </span>
                    </div>
                    <div
                      className={`text-lg sm:text-xl font-bold text-center sm:text-left ${
                        transferFilter === 'all'
                          ? 'text-white'
                          : 'text-emerald-600'
                      }`}
                    >
                      {transferCustomers.length}
                    </div>
                  </button>
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
                    <i
                      className={`text-gray-400 text-2xl ${
                        activeTab === 'finalized'
                          ? 'fa-solid fa-circle-check'
                          : activeTab === 'transfers'
                            ? 'fa-solid fa-arrows-turn-right'
                            : 'fa-solid fa-archive'
                      }`}
                    ></i>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {searchTerm
                      ? 'Nenhum resultado encontrado'
                      : activeTab === 'finalized'
                        ? 'Nenhuma venda finalizada ainda'
                        : activeTab === 'transfers'
                          ? 'Nenhuma transferência recebida ainda'
                          : 'Nenhum cliente arquivado'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm && 'Tente outro termo de busca'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredCustomers.map((customer, index) => {
                    const isArchivedTab = activeTab === 'archived';
                    const isTransferTab = activeTab === 'transfers';

                    return (
                      <AnimatedListItem
                        key={`${activeTab}-${customer.id}`}
                        index={index}
                      >
                        {isTransferTab ? (
                          <TransferCard customer={customer} />
                        ) : isArchivedTab ? (
                          <ArchivedCard
                            customer={customer}
                            onRestore={handleRestore}
                            onDelete={handleDelete}
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
