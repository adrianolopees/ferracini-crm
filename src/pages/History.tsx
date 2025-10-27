import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer, ContactedCustomer } from '@/types/customer';
import { Input, PageLayout, Tabs } from '@/components/ui';
import toast from 'react-hot-toast';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { CustomerCard } from '@/components/features';

type TabType = 'finalized' | 'contacted' | 'archived';

function History() {
  const [activeTab, setActiveTab] = useState<TabType>('finalized');
  const [searchTerm, setSearchTerm] = useState('');
  const [finalizedCustomers, setFinalizedCustomers] = useState<Customer[]>([]);
  const [contactedCustomers, setContactedCustomers] = useState<
    ContactedCustomer[]
  >([]);
  const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    (Customer | ContactedCustomer)[]
  >([]);
  const [loading, setLoading] = useState(true);

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
        : activeTab === 'contacted'
          ? contactedCustomers
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
    contactedCustomers,
    archivedCustomers,
  ]);

  const fetchAllCustomers = async () => {
    try {
      setLoading(true);

      const finalized: Customer[] = [];
      const contacted: ContactedCustomer[] = [];
      const archived: Customer[] = [];
      const contactedIds = new Set<string>(); // Evitar duplicatas

      // Buscar todas as coleções em paralelo
      const [contactedSnapshot, clientesSnapshot] = await Promise.all([
        getDocs(collection(db, 'contacted')),
        getDocs(collection(db, 'customers')),
      ]);

      // Processar coleção 'contacted' (dados legados)
      contactedSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.archived) {
          contacted.push({ id: doc.id, ...data } as ContactedCustomer);
          contactedIds.add(doc.id);
        }
      });

      // Processar coleção 'customers'
      clientesSnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.archived) {
          // Arquivados (exceto finalizados)
          if (data.status !== 'completed') {
            archived.push({ id: doc.id, ...data } as Customer);
          }
        } else if (data.status === 'completed') {
          // Vendas finalizadas
          finalized.push({ id: doc.id, ...data } as Customer);
        } else if (data.status === 'ready_for_pickup' && !contactedIds.has(doc.id)) {
          // Contactados (excluindo duplicatas da coleção contacted)
          contacted.push({ id: doc.id, ...data } as ContactedCustomer);
          contactedIds.add(doc.id);
        }
      });

      setFinalizedCustomers(finalized);
      setContactedCustomers(contacted);
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
      await updateDoc(doc(db, 'customers', customer.id), {
        archived: false,
        archiveReason: null,
        archivedAt: null,
        notes: null,
      });

      toast.success(`${customer.name} restaurado para clientes ativos!`);
      fetchAllCustomers(); // Recarregar listas
    } catch (error) {
      console.error('Erro ao restaurar cliente:', error);
      toast.error('Erro ao restaurar cliente');
    }
  };

  const tabs = [
    {
      id: 'finalized',
      label: 'Vendas Finalizadas',
      count: finalizedCustomers.length,
      icon: 'fa-solid fa-circle-check',
    },
    {
      id: 'contacted',
      label: 'Contactados',
      count: contactedCustomers.length,
      icon: 'fa-solid fa-box-open',
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
      subtitle="Vendas finalizadas, contactados e arquivados"
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

            {/* Lista de clientes */}
            <div className="space-y-4">
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
                          : activeTab === 'contacted'
                            ? 'fa-solid fa-box-open'
                            : 'fa-solid fa-archive'
                      }`}
                    ></i>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {searchTerm
                      ? 'Nenhum resultado encontrado'
                      : activeTab === 'finalized'
                        ? 'Nenhuma venda finalizada ainda'
                        : activeTab === 'contacted'
                          ? 'Nenhum cliente contactado ainda'
                          : 'Nenhum cliente arquivado'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm && 'Tente outro termo de busca'}
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const isArchivedTab = activeTab === 'archived';

                  return (
                    <AnimatedListItem key={customer.id} index={index}>
                      <CustomerCard
                        customer={customer}
                        variant="compact"
                        onRestore={isArchivedTab ? handleRestore : undefined}
                      />
                    </AnimatedListItem>
                  );
                })
              )}
            </div>
          </Tabs>
        </div>
      </AnimatedContainer>
    </PageLayout>
  );
}

export default History;
