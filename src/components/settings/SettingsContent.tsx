import { useState } from 'react';
import useStoreSettings from '@/hooks/useStoreSettings';
import StoreCard from './StoreCard';
import StoreForm from './StoreForm';
import { CreateStore } from '@/schemas/storeSettingsSchema';
import { toast } from 'sonner';
import { Spinner, Button } from '@/components/ui';

export default function SettingsContent() {
  const { addStore, updateStore, loading, removeStore, defaultStore, transferStores } = useStoreSettings();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddStore = async (data: CreateStore) => {
    try {
      await addStore(data);
      toast.success('Loja adicionada!');
      setShowAddForm(false);
    } catch {
      toast.error('Erro ao adicionar loja');
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

  // Estado de erro
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
      {/* Loja Principal */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Minha Loja</h3>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">Principal</span>
        </div>
        <StoreCard
          store={defaultStore}
          onUpdate={(updates) => updateStore(defaultStore.id, updates)}
          canDelete={false}
        />
      </section>

      {/* Lojas de Transferência */}
      <section>
        <div className="flex items-center justify-between mb-3">
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
    </div>
  );
}
