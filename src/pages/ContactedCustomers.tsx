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
import { Input, Modal, Navigation } from '@/components/ui';
import { formatDistanceToNow } from '@/utils';
import toast from 'react-hot-toast';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { differenceInDays, parseISO } from 'date-fns';

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
    const mensagem = `Oi ${customer.cliente}! Ferracini Maxi Shopping aqui!`;
    const celularSomenteNumeros = customer.celular.replace(/\D/g, '');
    const urlWhatsApp = `https://wa.me/55${celularSomenteNumeros}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
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
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <AnimatedContainer type="slideDown" className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Histórico de <span className="text-blue-600">Contatos</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              {allCustomers.length} cliente(s) contactado(s)
            </p>
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
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {customer.cliente}
                                </h3>
                                <span
                                  className="inline-block w-2 h-2 rounded-full bg-blue-500"
                                  title="Contactado"
                                ></span>
                              </div>
                              <span className="text-xs block mb-1 text-blue-600 font-medium">
                                Contactado{' '}
                                {formatDistanceToNow(customer.dataContacto)}
                              </span>
                              <span className="text-xs text-gray-500">
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

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Modelo:</span>
                              <p className="font-medium text-gray-900">
                                {customer.modelo}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Referência:</span>
                              <p className="font-medium text-gray-900">
                                {customer.referencia}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Numeração:</span>
                              <p className="font-medium text-gray-900">
                                {customer.numeracao}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Cor:</span>
                              <p className="font-medium text-gray-900">
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
