import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, CreateStore, CreateStoreSchema } from '@/schemas/storeSettingsSchema';
import { Input, Button, Spinner } from '@/components/ui';
import { maskPhone } from '@/utils';

interface StoreFormProps {
  initialData?: Store;
  onSubmit: (data: CreateStore) => Promise<void>;
  onCancel: () => void;
}

export default function StoreForm({ initialData, onSubmit, onCancel }: StoreFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateStore>({
    resolver: zodResolver(CreateStoreSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      color: initialData?.color || '#3B82F6',
    },
  });

  const color = watch('color');

  const handleFormSubmit = async (data: CreateStore) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.';
      setError('root', { type: 'manual', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{initialData ? 'Editar Loja' : 'Nova Loja'}</h4>

      {/* Erro global */}
      {errors.root && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{errors.root.message}</span>
        </div>
      )}

      {/* Grid 2 colunas no desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
        <Input
          label="Nome"
          placeholder="Ex: Itu Shopping"
          {...register('name')}
          error={errors.name?.message}
          disabled={isLoading}
          required
        />

        <Input
          label="Telefone"
          type="tel"
          placeholder="(11) 98765-4321"
          {...register('phone')}
          onChange={(e) => {
            const masked = maskPhone(e.target.value);
            setValue('phone', masked);
          }}
          error={errors.phone?.message}
          disabled={isLoading}
          required
        />
      </div>

      {/* Cor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...register('color')}
              onChange={(e) => setValue('color', e.target.value.toUpperCase())}
              className="w-12 h-[42px] rounded cursor-pointer border border-gray-300 flex-shrink-0"
              disabled={isLoading}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setValue('color', e.target.value.toUpperCase())}
              className={`flex-1 px-4 py-2.5 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.color ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="#3B82F6"
              maxLength={7}
              disabled={isLoading}
            />
          </div>
          <span
            className="self-start sm:self-auto px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-sm truncate max-w-full sm:max-w-[160px]"
            style={{ backgroundColor: color }}
          >
            {watch('name') || 'Preview'}
          </span>
        </div>
        {errors.color && (
          <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} fullWidth size="sm">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Salvando...
            </span>
          ) : (
            'Salvar'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          fullWidth
          size="sm"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
