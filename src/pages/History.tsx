import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer, ContactedCustomer } from '@/types/customer';
import { Input, PageLayout, Tabs } from '@/components/ui';
import { formatDistanceToNow } from '@/utils';
import toast from 'react-hot-toast';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { differenceInDays, parseISO } from 'date-fns';
import { sendGenericMessage } from '@/services/whatsappService';

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

  // Filtrar quando mudar busca ou tab
  useEffect(() => {
    // Limpar busca ao trocar de tab
    setSearchTerm('');

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
          customer.cliente.toLowerCase().includes(term) ||
          customer.modelo.toLowerCase().includes(term) ||
          customer.referencia.toLowerCase().includes(term) ||
          customer.celular.includes(term)
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
        getDocs(collection(db, 'clientes')),
      ]);

      // Processar coleção 'contacted' (dados legados)
      contactedSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.arquivado) {
          contacted.push({ id: doc.id, ...data } as ContactedCustomer);
          contactedIds.add(doc.id);
        }
      });

      // Processar coleção 'clientes'
      clientesSnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.arquivado) {
          // Arquivados (exceto finalizados)
          if (data.status !== 'finalizado') {
            archived.push({ id: doc.id, ...data } as Customer);
          }
        } else if (data.status === 'finalizado') {
          // Vendas finalizadas
          finalized.push({ id: doc.id, ...data } as Customer);
        } else if (data.status === 'contactado' && !contactedIds.has(doc.id)) {
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

  const handleWhatsApp = (customer: Customer | ContactedCustomer) => {
    sendGenericMessage(customer);
  };

  const handleRestore = async (customer: Customer) => {
    try {
      await updateDoc(doc(db, 'clientes', customer.id), {
        arquivado: false,
        motivoArquivamento: null,
        dataArquivamento: null,
        observacoes: null,
      });

      toast.success(`${customer.cliente} restaurado para clientes ativos!`);
      fetchAllCustomers(); // Recarregar listas
    } catch (error) {
      console.error('Erro ao restaurar cliente:', error);
      toast.error('Erro ao restaurar cliente');
    }
  };

  const calculateWaitingTime = (dataCriacao: string, dataContacto: string) => {
    try {
      const criacao = parseISO(dataCriacao);
      const contato = parseISO(dataContacto);
      return differenceInDays(contato, criacao);
    } catch {
      return 0;
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
      maxWidth="4xl"
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
                label={`Buscar em ${
                  activeTab === 'finalized'
                    ? 'Vendas Finalizadas'
                    : activeTab === 'contacted'
                      ? 'Contactados'
                      : 'Arquivados'
                }`}
                type="search"
                placeholder="Digite nome, modelo, referência ou telefone..."
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
                  const isFinalized = activeTab === 'finalized';
                  const isContactedTab = activeTab === 'contacted';
                  const isArchivedTab = activeTab === 'archived';

                  return (
                    <AnimatedListItem key={customer.id} index={index}>
                      <div
                        className={`${
                          isFinalized
                            ? 'bg-emerald-50/50 border-l-emerald-500'
                            : isContactedTab
                              ? 'bg-blue-50 border-l-blue-500'
                              : 'bg-orange-50 border-l-orange-500'
                        } rounded-lg p-5 border-l-4 hover:shadow-md transition-shadow duration-200`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                  {customer.cliente}
                                </h3>
                                {isFinalized ? (
                                  <i
                                    className="fa-solid fa-circle-check text-emerald-600"
                                    title="Venda Concluída"
                                  ></i>
                                ) : (
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      isContactedTab
                                        ? 'bg-blue-500'
                                        : 'bg-orange-500'
                                    }`}
                                    title={
                                      isContactedTab
                                        ? 'Contactado'
                                        : 'Arquivado'
                                    }
                                  ></span>
                                )}
                              </div>
                              {customer.vendedor && (
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {customer.vendedor}
                                </span>
                              )}
                            </div>

                            {/* Data info */}
                            {isFinalized && customer.dataFinalizacao ? (
                              <span className="text-sm block mb-1 text-emerald-600 font-medium">
                                Finalizada em{' '}
                                {new Date(
                                  customer.dataFinalizacao
                                ).toLocaleDateString('pt-BR')}
                              </span>
                            ) : isContactedTab && 'dataContacto' in customer && customer.dataContacto ? (
                              <>
                                <span className="text-sm block mb-1 text-blue-600 font-medium">
                                  Contactado{' '}
                                  {formatDistanceToNow(customer.dataContacto)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Esperou{' '}
                                  {calculateWaitingTime(
                                    customer.dataCriacao,
                                    customer.dataContacto
                                  )}{' '}
                                  dia(s) até o contato
                                </span>
                              </>
                            ) : isArchivedTab ? (
                              <>
                                <span className="text-sm block mb-1 text-orange-600 font-medium">
                                  Arquivado{' '}
                                  {customer.dataArquivamento &&
                                    formatDistanceToNow(
                                      customer.dataArquivamento
                                    )}
                                </span>
                                {customer.motivoArquivamento && (
                                  <span className="text-sm text-gray-600">
                                    Motivo:{' '}
                                    <span className="font-medium">
                                      {customer.motivoArquivamento}
                                    </span>
                                  </span>
                                )}
                              </>
                            ) : null}

                            {/* WhatsApp */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm sm:text-base text-gray-600">
                                {customer.celular}
                              </span>
                              <button
                                onClick={() => handleWhatsApp(customer)}
                                className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors cursor-pointer"
                                title="Enviar WhatsApp"
                              >
                                <i className="fa-brands fa-whatsapp text-lg"></i>
                              </button>
                            </div>
                          </div>

                          {/* Botão de ação */}
                          {isArchivedTab && (
                            <button
                              onClick={() => handleRestore(customer)}
                              className="inline-flex items-center justify-center w-9 h-9 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Restaurar cliente"
                            >
                              <i className="fa-solid fa-arrow-rotate-left text-lg"></i>
                            </button>
                          )}
                        </div>

                        {/* Detalhes do produto */}
                        <div className="grid grid-cols-2 gap-4 text-base">
                          <div>
                            <span className="text-gray-500 text-sm">
                              Modelo:
                            </span>
                            <p className="font-semibold text-gray-900">
                              {customer.modelo}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">
                              Referência:
                            </span>
                            <p className="font-semibold text-gray-900">
                              {customer.referencia}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">
                              Numeração:
                            </span>
                            <p className="font-semibold text-gray-900">
                              {customer.numeracao}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Cor:</span>
                            <p className="font-semibold text-gray-900">
                              {customer.cor}
                            </p>
                          </div>
                        </div>
                      </div>
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
