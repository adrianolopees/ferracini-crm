import { useState } from 'react';
import useStoreSettings from '@/hooks/useStoreSettings';
import StoreCard from './StoreCard';
import StoreForm from './StoreForm';
import { CreateStore } from '@/schemas/storeSettingsSchema';
import { toast } from 'sonner';
import { Spinner, Button, Input } from '@/components/ui';

type Tab = 'stores' | 'salespeople';

export default function SettingsContent() {
  const {
    addStore,
    updateStore,
    loading,
    removeStore,
    defaultStore,
    transferStores,
    salespeople,
    addSalesperson,
    removeSalesperson,
  } = useStoreSettings();
  const [activeTab, setActiveTab] = useState<Tab>('stores');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSalesperson, setNewSalesperson] = useState('');

  const handleAddStore = async (data: CreateStore) => {
    try {
      await addStore(data);
      toast.success('Loja adicionada!');
      setShowAddForm(false);
    } catch {
      toast.error('Erro ao adicionar loja');
    }
  };

  const handleAddSalesperson = async () => {
    const name = newSalesperson.trim();
    if (!name) return;
    try {
      await addSalesperson(name);
      toast.success(`${name} adicionado!`);
      setNewSalesperson('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao adicionar vendedor');
    }
  };

  const handleRemoveSalesperson = async (name: string) => {
    try {
      await removeSalesperson(name);
      toast.success(`${name} removido!`);
    } catch {
      toast.error('Erro ao remover vendedor');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500">Carregando configurações...</p>
      </div>
    );
  }

  if (!defaultStore) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <p className="text-red-500">Configurações não encontradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === 'stores' ? 'border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Lojas
        </button>
        <button
          onClick={() => setActiveTab('salespeople')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${activeTab === 'salespeople' ? 'border-b-2 border-blue-600 text-blue-600' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Vendedores
        </button>
      </div>
      <div className="overflow-y-auto h-[60vh]">
        {activeTab === 'stores' && (
          <>
            <section>
              <div className="flex items-center gap-2 mb-3 mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Minha Loja</h3>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  Principal
                </span>
              </div>
              <StoreCard
                store={defaultStore}
                onUpdate={(updates) => updateStore(defaultStore.id, updates)}
                canDelete={false}
              />
            </section>
            <section>
              <div className="flex items-center justify-between mb-3 mt-6">
                <h3 className="text-lg font-semibold text-gray-800">Lojas de Transferência</h3>
                {!showAddForm && (
                  <Button variant="green" size="sm" onClick={() => setShowAddForm(true)}>
                    <i className="fa-solid fa-plus mr-1"></i>
                    Adicionar
                  </Button>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Lojas de onde você recebe produtos. Aparecem nos botões de consulta.
              </p>
              {/* Formulário Adicionar */}
              {showAddForm && (
                <div className="mb-4">
                  <StoreForm onSubmit={handleAddStore} onCancel={() => setShowAddForm(false)} />
                </div>
              )}
              {/* Lista de lojas */}
              <div className="space-y-3">
                {transferStores.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <i className="fa-solid fa-store text-3xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500 text-sm">Nenhuma loja de transferência</p>
                    <p className="text-gray-400 text-xs mt-1">Clique em "Adicionar" acima</p>
                  </div>
                ) : (
                  transferStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onUpdate={(updates) => updateStore(store.id, updates)}
                      onDelete={() => {
                        if (confirm(`Remover loja "${store.name}"?`)) {
                          removeStore(store.id)
                            .then(() => toast.success('Loja removida'))
                            .catch(() => toast.error('Erro ao remover'));
                        }
                      }}
                      canDelete={true}
                    />
                  ))
                )}
              </div>
            </section>
          </>
        )}
        {activeTab === 'salespeople' && (
          <>
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Vendedores</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">Lista de vendedores disponíveis no cadastro de clientes.</p>
              {/* Adicionar vendedor */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nome do vendedor"
                  value={newSalesperson}
                  onChange={(e) => setNewSalesperson(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSalesperson()}
                />
                <Button variant="green" size="sm" onClick={handleAddSalesperson} className="h-[42px]">
                  <i className="fa-solid fa-plus mr-1"></i>
                  Adicionar
                </Button>
              </div>
              {/* Lista de vendedores */}
              {salespeople.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <i className="fa-solid fa-user text-3xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500 text-sm">Nenhum vendedor cadastrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {salespeople.map((name) => (
                    <div
                      key={name}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-user text-gray-400 text-sm"></i>
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSalesperson(name)}
                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remover vendedor"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
