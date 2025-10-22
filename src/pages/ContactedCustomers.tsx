import { useState, useEffect } from 'react';
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ContactedCustomer } from '@/types/customer';
import { Input, Modal, Navigation, PageHeader } from '@/components/ui';
import { formatDistanceToNow } from '@/utils';
import toast from 'react-hot-toast';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { differenceInDays, parseISO } from 'date-fns';
import { sendGenericMessage } from '@/services/whatsappService';

function ContactedCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allCustomers, setAllCustomers] = useState<ContactedCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<
    ContactedCustomer[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<ContactedCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar todos os clientes contactados quando a página carregar
  useEffect(() => {
    fetchContactedCustomers();
  }, []);

  // Filtrar clientes quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(allCustomers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = allCustomers.filter(
        (customer) =>
          customer.cliente.toLowerCase().includes(term) ||
          customer.modelo.toLowerCase().includes(term) ||
          customer.referencia.toLowerCase().includes(term) ||
          customer.celular.includes(term)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, allCustomers]);

  const fetchContactedCustomers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'contacted'),
        orderBy('dataContacto', 'desc') // Mais recentes primeiro
      );

      const snapshot = await getDocs(q);
      const customers: ContactedCustomer[] = [];

      snapshot.forEach((doc) => {
        customers.push({ id: doc.id, ...doc.data() } as ContactedCustomer);
      });

      setAllCustomers(customers);
      setFilteredCustomers(customers);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  // Calcular quantos dias o cliente esperou até ser contactado
  const calculateWaitingTime = (dataCriacao: string, dataContacto: string) => {
    try {
      const criacao = parseISO(dataCriacao);
      const contato = parseISO(dataContacto);
      return differenceInDays(contato, criacao);
    } catch {
      return 0;
    }
  };

  const handleWhatsApp = (customer: ContactedCustomer) => {
    sendGenericMessage(customer);
  };

  const handleDeleteClick = (customer: ContactedCustomer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteDoc(doc(db, 'contacted', selectedCustomer.id));
      toast.success(`${selectedCustomer.cliente} removido(a) do histórico!`);
      setModalOpen(false);
      setSelectedCustomer(null);
      fetchContactedCustomers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir do histórico:', error);
      toast.error('Erro ao excluir. Tente novamente.');
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 ">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <AnimatedContainer type="slideDown">
            <PageHeader
              title="Histórico de"
              highlight="Contatos"
              subtitle={`${allCustomers.length} cliente(s) contactado(s)`}
            />
          </AnimatedContainer>

          {/* Card de Busca */}
          <AnimatedContainer type="slideUp" delay={0.2}>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <Input
                label="Buscar no Histórico"
                type="search"
                placeholder="Digite nome, modelo, referência ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Resultados */}
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 mt-4">
                      Carregando histórico...
                    </p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <i className="fa-solid fa-clock-rotate-left text-gray-400 text-2xl"></i>
                    </div>
                    <p className="text-gray-600 font-medium">
                      {searchTerm
                        ? 'Nenhum resultado encontrado'
                        : 'Nenhum cliente contactado ainda'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {searchTerm
                        ? 'Tente outro termo de busca'
                        : 'Clientes contactados aparecerão aqui'}
                    </p>
                  </div>
                ) : (
                  filteredCustomers.map((customer, index) => {
                    const waitingDays = calculateWaitingTime(
                      customer.dataCriacao,
                      customer.dataContacto
                    );

                    return (
                      <AnimatedListItem key={customer.id} index={index}>
                        <div
                          className="bg-gray-50 rounded-lg p-5 border-l-4 border-l-blue-500 hover:shadow-md
  transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                    {customer.cliente}
                                  </h3>
                                  <span
                                    className="inline-block w-2 h-2 rounded-full bg-blue-500"
                                    title="Contactado"
                                  ></span>
                                </div>
                                {customer.vendedor && (
                                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {customer.vendedor}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm block mb-1 text-blue-600 font-medium">
                                Contactado{' '}
                                {formatDistanceToNow(customer.dataContacto)}
                              </span>
                              <span className="text-sm text-gray-500">
                                Esperou {waitingDays} dia(s) até o contato
                              </span>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm sm:text-base text-gray-600">
                                  {customer.celular}
                                </span>
                                <button
                                  onClick={() => handleWhatsApp(customer)}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white
  rounded-full hover:bg-green-600 transition-colors cursor-pointer"
                                  title="Enviar WhatsApp"
                                >
                                  <i className="fa-brands fa-whatsapp text-lg"></i>
                                </button>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteClick(customer)}
                              className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50
  rounded-lg transition-colors cursor-pointer"
                              title="Excluir do histórico"
                            >
                              <i className="fa-regular fa-trash-can text-lg"></i>
                            </button>
                          </div>

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
                              <span className="text-gray-500 text-sm">
                                Cor:
                              </span>
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
            </div>
          </AnimatedContainer>
        </div>

        <Modal
          isOpen={modalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          onClose={handleCancelDelete}
          title="Deseja remover este cliente do histórico?"
        />
      </div>
    </div>
  );
}

export default ContactedCustomers;
