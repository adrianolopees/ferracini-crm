import { useState } from 'react';
import { Store, UpdateStore } from '@/schemas/storeSettingsSchema';
import StoreForm from './StoreForm';
import { toast } from 'react-hot-toast';

interface StoreCardProps {
  store: Store;
  onUpdate: (updates: UpdateStore) => Promise<void>;
  onDelete?: () => void;
  canDelete: boolean;
}

export default function StoreCard({ store, onUpdate, onDelete, canDelete }: StoreCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (updates: UpdateStore) => {
    try {
      await onUpdate(updates);
      toast.success('Loja atualizada!');
      setIsEditing(false);
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  // Modo edição: mostra formulário
  if (isEditing) {
    return <StoreForm initialData={store} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />;
  }

  // Modo visualização: mostra card
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Info da loja */}
        <div className="flex items-center gap-3">
          {/* Cor indicator */}
          <div className="w-10 h-10 rounded-lg shadow-sm flex-shrink-0" style={{ backgroundColor: store.color }} />
          <div>
            <h4 className="font-semibold text-gray-800">{store.name}</h4>
            <p className="text-sm text-gray-500">{store.phone}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="Editar"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Remover"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
