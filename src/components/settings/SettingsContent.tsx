import { useState } from 'react';
import useStoreSettings from '@/hooks/useStoreSettings';
import StoreCard from './StoreCard';
import StoreForm from './StoreForm';
import { CreateStore } from '@/schemas/storeSettingsSchema';
import { toast } from 'sonner';
import { Spinner, Button } from '@/components/ui';

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
  const [confirmDeleteSalesperson, setConfirmDeleteSalesperson] = useState<string | null>(null);

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
      setConfirmDeleteSalesperson(null);
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
    <div className="flex flex-col h-[58vh]">
      {/* Tabs nav — fixo, não scrollável */}
      <div className="flex border-b border-gray-200 mb-5 flex-shrink-0">
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

      {/* Conteúdo — scroll único aqui */}
      <div className="flex-1 overflow-y-auto">

      {/* Tab: Lojas */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {/* Loja Principal */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Minha Loja</h3>
            <StoreCard
              store={defaultStore}
              onUpdate={(updates) => updateStore(defaultStore.id, updates)}
              canDelete={false}
            />
          </section>

          {/* Lojas de Transferência */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Lojas de Transferência</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aparecem nos botões de consulta do workflow</p>
              </div>
              {!showAddForm && (
                <Button variant="green" size="sm" onClick={() => setShowAddForm(true)}>
                  <i className="fa-solid fa-plus mr-1"></i>
                  Adicionar
                </Button>
              )}
            </div>

            {showAddForm && (
              <div className="mb-4">
                <StoreForm onSubmit={handleAddStore} onCancel={() => setShowAddForm(false)} />
              </div>
            )}

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
                    onDelete={() =>
                      removeStore(store.id)
                        .then(() => toast.success('Loja removida'))
                        .catch(() => toast.error('Erro ao remover'))
                    }
                    canDelete={true}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Tab: Vendedores */}
      {activeTab === 'salespeople' && (
        <div className="space-y-4">
          {/* Adicionar vendedor */}
          <div className="flex items-center gap-2">
            <input
              placeholder="Nome do vendedor"
              value={newSalesperson}
              onChange={(e) => setNewSalesperson(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSalesperson()}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            />
            <Button variant="green" size="sm" onClick={handleAddSalesperson}>
              <i className="fa-solid fa-plus mr-1"></i>
              Adicionar
            </Button>
          </div>

          {/* Lista */}
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

                  {confirmDeleteSalesperson === name ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">Remover?</span>
                      <button
                        onClick={() => handleRemoveSalesperson(name)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition cursor-pointer"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmDeleteSalesperson(null)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteSalesperson(name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Remover vendedor"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
}
