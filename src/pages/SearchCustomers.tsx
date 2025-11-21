import { useState, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { findCustomersByReference, findCustomersByModel, updateCustomer } from '@/repositories';
import { notifyProductArrived } from '@/services/whatsappService';
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import { Input, PageLayout } from '@/components/ui';
import { WorkflowCard } from '@/components/dashboard';
import { ArchiveModal } from '@/components/modals';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { archiveCustomer } from '@/services/customerActionService';

function SearchCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setCustomers([]);
      return;
    }

    try {
      const valorBuscado = value.trim();

      // Busca por referência e modelo usando repository
      const [refResults, modelResults] = await Promise.all([
        findCustomersByReference(valorBuscado),
        findCustomersByModel(valorBuscado),
      ]);

      const results: Customer[] = [];

      // Adiciona resultados por referência
      refResults.forEach((customer) => {
        if (!customer.archived && (!customer.status || customer.status === 'pending') && !customer.consultingStore) {
          results.push(customer);
        }
      });

      // Adiciona resultados por modelo (sem duplicar)
      modelResults.forEach((customer) => {
        if (
          !results.some((c) => c.id === customer.id) &&
          !customer.archived &&
          (!customer.status || customer.status === 'pending') &&
          !customer.consultingStore
        ) {
          results.push(customer);
        }
      });

      setCustomers(results);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleWhatsApp = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, {
        status: 'readyForPickup',
        contactedAt: new Date().toISOString(),
        sourceStore: 'Jundiaí',
      });

      notifyProductArrived(customer);
      toast.success(`${customer.name} movido para "Pronto para Retirada"!`);
      setCustomers(customers.filter((c) => c.id !== customer.id));
    } catch (error) {
      console.error('Erro ao processar contato:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
    }
  };

  const handleArchiveClick = (customer: Customer) => {
    setCustomerToArchive(customer);
    setArchiveModalOpen(true);
  };

  const handleArchiveCustomer = async (reason: ArchiveReason, notes?: string) => {
    if (!customerToArchive) return;
    try {
      await archiveCustomer(customerToArchive, reason, notes);
      toast.success(`${customerToArchive.name} arquivado com sucesso!`);
    } catch (error) {
      console.error('Erro ao arquivar cliente:', error);
      toast.error('Erro ao arquivar cliente');
    }
  };

  return (
    <PageLayout
      title="Buscar"
      highlight="Clientes"
      subtitle="Produto novo chegou? Encontre quem está aguardando"
      maxWidth="2xl"
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
                <p className="text-gray-600 font-medium">Nenhum cliente encontrado</p>
                <p className="text-gray-500 text-sm mt-1">Tente buscar por outro modelo ou referência</p>
              </div>
            )}

            {customers.map((customer, index) => (
              <AnimatedListItem key={customer.id} index={index}>
                <WorkflowCard customer={customer} onSendMessage={handleWhatsApp} onArchive={handleArchiveClick} />
              </AnimatedListItem>
            ))}
          </div>
        </div>
      </AnimatedContainer>

      <ArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleArchiveCustomer}
        customerName={customerToArchive?.name || ''}
      />
    </PageLayout>
  );
}

export default SearchCustomers;
