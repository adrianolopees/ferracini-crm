import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formSchema, FormData } from '@/schemas/registerSchema';
import { getFirebaseErrorMessage, maskPhone } from '@/utils';
import toast from 'react-hot-toast';
import { Input, Select, Button, Spinner, PageLayout } from '@/components/ui';
import { AnimatedContainer } from '@/components/animations';

function RegisterCustomer() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      phone: '',
      model: '',
      reference: '',
      size: '',
      color: '',
      salesperson: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await toast.promise(
        addDoc(collection(db, 'customers'), {
          ...data,
          reference: data.reference.toLowerCase(),
          model: data.model.toLowerCase(),
          createdAt: new Date().toISOString(),
          archived: false,
        }),
        {
          loading: 'Salvando cliente...',
          success: 'Cliente registrado!',
          error: 'Erro ao salvar!',
        }
      );
      reset();
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout
      title="Reservas de"
      highlight="Clientes"
      subtitle="Produto fora de estoque? Registre aqui"
      maxWidth="2xl"
    >
      {/* Card do Formulário */}
      <AnimatedContainer type="slideUp" delay={0.2} className="bg-white rounded-2xl shadow-xl p-8 ">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Mensagem de erro global */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
              <span className="bi bi-exclamation-triangle-fill"></span>
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Cliente"
                placeholder="Nome e sobrenome"
                {...register('name')}
                error={errors.name?.message}
                disabled={isLoading}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Celular"
                type="tel"
                placeholder="(00) 00000-0000"
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

            <Input
              label="Modelo"
              placeholder="Nome da linha"
              {...register('model')}
              error={errors.model?.message}
              disabled={isLoading}
              required
            />

            <Input
              label="Referência"
              placeholder="Referência completa"
              {...register('reference')}
              error={errors.reference?.message}
              disabled={isLoading}
              required
            />

            <Input
              label="Numeração"
              type="number"
              placeholder="37-47"
              {...register('size')}
              error={errors.size?.message}
              disabled={isLoading}
              min="37"
              max="47"
              required
            />

            <Input
              label="Cor"
              placeholder="Cor do produto"
              {...register('color')}
              error={errors.color?.message}
              disabled={isLoading}
              required
            />

            <Select
              label="Vendedor"
              placeholder="Selecione o vendedor"
              options={[
                { value: 'Adriano', label: 'Adriano' },
                { value: 'Will', label: 'Will' },
                { value: 'Marcelo', label: 'Marcelo' },
              ]}
              {...register('salesperson')}
              error={errors.salesperson?.message}
              disabled={isLoading}
              required
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isLoading} fullWidth={true} className="flex justify-center items-center">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 ">
                  <i className="fa-solid fa-bookmark"></i> {/* Adicione ícone */}
                  Registrar
                </span>
              )}
            </Button>
          </div>
        </form>
      </AnimatedContainer>
    </PageLayout>
  );
}

export default RegisterCustomer;
