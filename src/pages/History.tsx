import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import toast from 'react-hot-toast';
import { Customer } from '@/types/customer';
import { Input, PageLayout, Tabs, ConfirmModal } from '@/components/ui';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { CustomerCard } from '@/components/features';
import { useCustomerActions } from '@/hooks';

type TabType = 'finalized' | 'transfers' | 'archived';

function History() {
  const [activeTab, setActiveTab] = useState<TabType>('finalized');
  const [searchTerm, setSearchTerm] = useState('');
  const [finalizedCustomers, setFinalizedCustomers] = useState<Customer[]>([]);
  const [transferCustomers, setTransferCustomers] = useState<Customer[]>([]);
  const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
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
  }, [activeTab]);

  // Filtrar quando mudar busca ou listas
  useEffect(() => {
    const customers =
      activeTab === 'finalized'
        ? finalizedCustomers
        : activeTab === 'transfers'
          ? transferCustomers
          : archivedCustomers;

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
  ]);

  const fetchAllCustomers = async () => {
    try {
      setLoading(true);

      const finalized: Customer[] = [];
      const transfers: Customer[] = [];
      const archived: Customer[] = [];

      const snapshot = await getDocs(collection(db, 'customers'));

      snapshot.forEach((doc) => {
        const data = doc.data();

        if (data.archived) {
          // Arquivados (exceto finalizados)
          if (data.status !== 'completed') {
            archived.push({ id: doc.id, ...data } as Customer);
          }
        } else if (data.status === 'completed') {
          // Vendas finalizadas
          if (data.sourceStore) {
            // Transferências (finalizados com loja de origem)
            transfers.push({ id: doc.id, ...data } as Customer);
          } else {
            // Finalizados normais (sem transferência)
            finalized.push({ id: doc.id, ...data } as Customer);
          }
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
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabType)}
          >
            {/* Busca */}
            <div className="mb-6">
              <Input
                type="search"
                placeholder="Digite nome, modelo, referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Resumo de Transferências */}
            {activeTab === 'transfers' && transferCustomers.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-chart-pie text-blue-600 text-sm"></i>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Resumo de Transferências
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Campinas */}
                  <div className="bg-white rounded-lg p-2.5 border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <i className="fa-solid fa-store text-blue-500 text-xs"></i>
                      <span className="text-xs font-medium text-gray-600">Campinas</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {transferCustomers.filter(c => c.sourceStore === 'Campinas').length}
                    </div>
                  </div>

                  {/* Dom Pedro */}
                  <div className="bg-white rounded-lg p-2.5 border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <i className="fa-solid fa-store text-purple-500 text-xs"></i>
                      <span className="text-xs font-medium text-gray-600">Dom Pedro</span>
                    </div>
                    <div className="text-xl font-bold text-purple-600">
                      {transferCustomers.filter(c => c.sourceStore === 'Dom Pedro').length}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-white rounded-lg p-2.5 border border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <i className="fa-solid fa-chart-line text-emerald-500 text-xs"></i>
                      <span className="text-xs font-medium text-gray-600">Total</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-600">
                      {transferCustomers.length}
                    </div>
                  </div>
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
                filteredCustomers.map((customer, index) => {
                  const isArchivedTab = activeTab === 'archived';
                  const isTransferTab = activeTab === 'transfers';

                  return (
                    <AnimatedListItem key={customer.id} index={index}>
                      <CustomerCard
                        customer={customer}
                        variant={isTransferTab ? 'transfer' : isArchivedTab ? 'archived' : 'compact'}
                        onRestore={isArchivedTab ? handleRestore : undefined}
                        onDelete={isArchivedTab ? handleDelete : undefined}
                      />
                    </AnimatedListItem>
                  );
                })
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
