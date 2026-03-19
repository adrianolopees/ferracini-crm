import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, CreateStore, CreateStoreSchema } from '@/schemas/storeSettingsSchema';
import { Input, Button, Spinner } from '@/components/ui';
import { maskPhone } from '@/utils';

const BRAND_COLORS = [
  { hex: '#2563EB', name: 'Azul' },
  { hex: '#4F46E5', name: 'Índigo' },
  { hex: '#7C3AED', name: 'Violeta' },
  { hex: '#9333EA', name: 'Roxo' },
  { hex: '#0284C7', name: 'Céu' },
  { hex: '#0D9488', name: 'Teal' },
  { hex: '#0891B2', name: 'Ciano' },
  { hex: '#DB2777', name: 'Rosa' },
  { hex: '#E11D48', name: 'Carmim' },
  { hex: '#475569', name: 'Ardósia' },
];

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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Cor da loja <span className="text-red-500">*</span>
          </label>
          <span
            className="px-3 py-1 rounded-full text-white text-xs font-medium shadow-sm truncate max-w-[160px]"
            style={{ backgroundColor: color }}
          >
            {watch('name') || 'Preview'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {BRAND_COLORS.map((c) => {
            const isSelected = color.toUpperCase() === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                title={c.name}
                disabled={isLoading}
                onClick={() => setValue('color', c.hex, { shouldValidate: true })}
                className="w-8 h-8 rounded-full transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: c.hex,
                  boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : undefined,
                }}
              >
                {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
              </button>
            );
          })}
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
