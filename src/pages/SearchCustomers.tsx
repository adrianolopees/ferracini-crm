import { useState, ChangeEvent, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { updateCustomer, getAllCustomers } from '@/repositories';
import { notifyProductArrived } from '@/services/whatsappService';
import { Customer, ArchiveReason } from '@/schemas/customerSchema';
import { Input, PageLayout } from '@/components/ui';
import { WorkflowCard } from '@/components/dashboard';
import { ArchiveModal } from '@/components/modals';
import { AnimatedContainer, AnimatedListItem } from '@/components/animations';
import { WorkflowSkeleton } from '@/components/skeletons';
import { useAuth } from '@/hooks';
import { getCurrentTimestamp } from '@/utils';

function SearchCustomers() {
  const { workspaceId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomersSearch = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

      try {
        const allCustomers = await getAllCustomers(workspaceId);
        setAllCustomers(allCustomers);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersSearch();
  }, [workspaceId]);

  const filteredCustomers = useMemo(() => {
    if (searchTerm.trim() === '') return [];

    const term = searchTerm.toLowerCase();

    return allCustomers.filter((customer) => {
      const matchesRules =
        !customer.archived && (!customer.status || customer.status === 'pending') && !customer.consultingStore;

      const matchesSearch =
        customer.name.toLowerCase().includes(term) ||
        customer.model.toLowerCase().includes(term) ||
        customer.reference.toLowerCase().includes(term);

      return matchesRules && matchesSearch;
    });
  }, [searchTerm, allCustomers]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleWhatsApp = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, {
        status: 'readyForPickup',
        contactedAt: getCurrentTimestamp(),
        sourceStore: 'Jundiaí',
      });
      notifyProductArrived(customer);
      toast.success(`${customer.name} movido para "Pronto para Retirada"`);
      setAllCustomers(allCustomers.filter((c) => c.id !== customer.id));
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
      await updateCustomer(customerToArchive.id, {
        archived: true,
        archiveReason: reason,
        archivedAt: getCurrentTimestamp(),
        notes: notes || '',
      });
      toast.success(`${customerToArchive.name} arquivado com sucesso!`);
      setAllCustomers(allCustomers.filter((c) => c.id !== customerToArchive.id));
      setArchiveModalOpen(false);
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
            {loading ? (
              // Mostra skeleton enquanto carrega
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <WorkflowSkeleton key={i} />
                ))}
              </>
            ) : filteredCustomers.length === 0 && searchTerm ? (
              // Nenhum resultado encontrado
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <i className="fa-solid fa-magnifying-glass text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Nenhum cliente encontrado</p>
                <p className="text-gray-500 text-sm mt-1">Tente buscar por outro modelo ou referência</p>
              </div>
            ) : (
              // Lista de clientes filtrados
              filteredCustomers.map((customer, index) => (
                <AnimatedListItem key={customer.id} index={index}>
                  <WorkflowCard customer={customer} onSendMessage={handleWhatsApp} onArchive={handleArchiveClick} />
                </AnimatedListItem>
              ))
            )}
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
