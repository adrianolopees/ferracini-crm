import { useState } from 'react';
import { Store, UpdateStore } from '@/schemas/storeSettingsSchema';
import StoreForm from './StoreForm';
import { toast } from 'sonner';

interface StoreCardProps {
  store: Store;
  onUpdate: (updates: UpdateStore) => Promise<void>;
  onDelete?: () => void;
  canDelete: boolean;
}

export default function StoreCard({ store, onUpdate, onDelete, canDelete }: StoreCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleUpdate = async (updates: UpdateStore) => {
    try {
      await onUpdate(updates);
      toast.success('Loja atualizada!');
      setIsEditing(false);
    } catch {
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = () => {
    onDelete?.();
    setConfirmingDelete(false);
  };

  if (isEditing) {
    return <StoreForm initialData={store} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        {/* Info da loja */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${store.color}20`, color: store.color }}
          >
            <i className="fa-solid fa-store text-sm" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-800 truncate">{store.name}</h4>
            <p className="text-sm text-gray-500">{store.phone}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Remover?</span>
              <button
                onClick={handleDelete}
                className="px-2.5 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                title="Editar"
              >
                <i className="fa-solid fa-pen-to-square" />
              </button>
              {canDelete && onDelete && (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remover"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
