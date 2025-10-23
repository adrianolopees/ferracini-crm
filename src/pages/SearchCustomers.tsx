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
import { Input, Modal, PageLayout } from '@/components/ui';
import toast from 'react-hot-toast';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { notifyProductArrived } from '@/services/whatsappService';
import { CustomerCard } from '@/components/features';

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
    <PageLayout
      title="Buscar"
      highlight="Clientes"
      subtitle="Produto chegou? Encontre quem está esperando"
      maxWidth="4xl"
    >
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

            {customers.map((customer, index) => (
              <AnimatedListItem key={customer.id} index={index}>
                <CustomerCard
                  customer={customer}
                  onWhatsApp={handleWhatsApp}
                  onDelete={handleDeleteClick}
                />
              </AnimatedListItem>
            ))}
          </div>
        </div>
      </AnimatedContainer>

      <Modal
        isOpen={modalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCancelDelete}
        title="Você já entrou em contato com o cliente?"
      />
    </PageLayout>
  );
}

export default SearchCustomers;
