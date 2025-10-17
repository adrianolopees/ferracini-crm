import { useState, ChangeEvent } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Customer } from '@/types/customer';
import { Input, Modal, Navigation } from '@/components/ui';
import { formatDistanceToNow } from '@/utils';
import { getCustomerStatus } from '@/utils/customerStatus';
import toast from 'react-hot-toast';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { notifyProductArrived } from '@/services/whatsappService';

function SearchCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setCustomers([]);
      return;
    }

    try {
      const valorBuscado = value.toLowerCase().trim();

      const refQuery = query(
        collection(db, 'clientes'),
        where('referencia', '==', valorBuscado)
      );

      const modeloQuery = query(
        collection(db, 'clientes'),
        where('modelo', '==', valorBuscado)
      );

      const [refSnapshot, modeloSnapshot] = await Promise.all([
        getDocs(refQuery),
        getDocs(modeloQuery),
      ]);

      const results: Customer[] = [];
      refSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Customer);
      });

      modeloSnapshot.forEach((doc) => {
        if (!results.some((customer) => customer.id === doc.id)) {
          results.push({ id: doc.id, ...doc.data() } as Customer);
        }
      });

      setCustomers(results);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleWhatsApp = async (customer: Customer) => {
    try {
      // 1. Criar cópia do cliente para adicionar ao histórico
      const contactedCustomer = {
        ...customer, // Copia todos os dados originais
        dataContacto: new Date().toISOString(), // Adiciona data de contato AGORA
      };

      // 2. Adicionar à coleção 'contacted' (histórico)
      await setDoc(doc(db, 'contacted', customer.id), contactedCustomer);

      // 3. Remover da coleção 'clientes' (ativos)
      await deleteDoc(doc(db, 'clientes', customer.id));

      // 4. Abrir WhatsApp
      notifyProductArrived(customer);

      // 5. Mostrar mensagem de sucesso
      toast.success(`${customer.cliente} movido para o histórico!`);

      // 6. Atualizar lista de resultados (remove da tela)
      setCustomers(customers.filter((c) => c.id !== customer.id));
    } catch (error) {
      console.error('Erro ao processar contato:', error);
      toast.error('Erro ao mover para histórico. Tente novamente.');
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteDoc(doc(db, 'clientes', selectedCustomer.id));
      toast.success(`Cliente ${selectedCustomer.cliente} excluído(a)!`);
      setModalOpen(false);
      setSelectedCustomer(null);
      handleSearch({
        target: { value: searchTerm },
      } as ChangeEvent<HTMLInputElement>);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente. Tente novamente.');
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
              Buscar <span className="text-blue-600">Clientes</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Produto chegou? Encontre quem está esperando
            </p>
          </AnimatedContainer>

          {/* Card de Busca */}
          <AnimatedContainer type="slideUp" delay={0.2}>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
              <Input
                label="Buscar Clientes"
                type="search"
                placeholder="Digite o modelo ou referência..."
                value={searchTerm}
                onChange={handleSearch}
              />

              {/* Resultados */}
              <div className="mt-6 space-y-4">
                {customers.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <i className="fa-solid fa-magnifying-glass text-gray-400 text-2xl"></i>
                    </div>
                    <p className="text-gray-600 font-medium">
                      Nenhum cliente encontrado
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Tente buscar por outro modelo ou referência
                    </p>
                  </div>
                )}

                {customers.map((customer, index) => {
                  const status = getCustomerStatus(customer.dataCriacao);

                  return (
                    <AnimatedListItem key={customer.id} index={index}>
                      <div
                        className={`bg-gray-50 rounded-lg p-5 border-l-4 hover:shadow-md transition-shadow duration-200 ${status.borderClass}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                  {customer.cliente}
                                </h3>
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${status.dotClass}`}
                                  title={status.label}
                                ></span>
                              </div>
                              {customer.vendedor && (
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {customer.vendedor}
                                </span>
                              )}
                            </div>
                            <span className={`text-sm block mb-2 ${status.textClass}`}>
                              Aguardando há{' '}
                              {formatDistanceToNow(customer.dataCriacao)}
                            </span>
                          <div className="flex items-center gap-2">
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
                        <button
                          onClick={() => handleDeleteClick(customer)}
                          className="inline-flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir cliente"
                        >
                          <i className="fa-regular fa-trash-can text-lg"></i>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div>
                          <span className="text-gray-500 text-sm">Modelo:</span>
                          <p className="font-semibold text-gray-900">
                            {customer.modelo}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Referência:</span>
                          <p className="font-semibold text-gray-900">
                            {customer.referencia}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Numeração:</span>
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
                })}
              </div>
            </div>
          </AnimatedContainer>
        </div>

        <Modal
          isOpen={modalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          onClose={handleCancelDelete}
          title="Você já entrou em contato com o cliente?"
        />
      </div>
    </div>
  );
}

export default SearchCustomers;
