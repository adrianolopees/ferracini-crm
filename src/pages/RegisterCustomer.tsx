import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { formSchema, FormData } from '@/schemas/registerSchema';
import { getFirebaseErrorMessage, maskPhone } from '@/utils';
import toast from 'react-hot-toast';
import { Input, Button, Navigation, Spinner } from '@/components/ui';
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
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await toast.promise(
        addDoc(collection(db, 'clientes'), {
          ...data,
          referencia: data.referencia.toLowerCase(),
          modelo: data.modelo.toLowerCase(),
          dataCriacao: new Date().toISOString(),
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
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <AnimatedContainer type="slideDown" className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Reserva de <span className="text-blue-600">Cliente</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Produto fora de estoque? Registre aqui
            </p>
          </AnimatedContainer>

          {/* Card do Formulário */}
          <AnimatedContainer
            type="slideUp"
            delay={0.2}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
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
                    {...register('cliente')}
                    error={errors.cliente?.message}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Celular"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    {...register('celular')}
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      setValue('celular', masked);
                    }}
                    error={errors.celular?.message}
                    disabled={isLoading}
                    required
                  />
                </div>

                <Input
                  label="Modelo"
                  placeholder="Nome da linha"
                  {...register('modelo')}
                  error={errors.modelo?.message}
                  disabled={isLoading}
                  required
                />

                <Input
                  label="Referência"
                  placeholder="Referência completa"
                  {...register('referencia')}
                  error={errors.referencia?.message}
                  disabled={isLoading}
                  required
                />

                <Input
                  label="Numeração"
                  type="number"
                  placeholder="37-47"
                  {...register('numeracao')}
                  error={errors.numeracao?.message}
                  disabled={isLoading}
                  min="37"
                  max="47"
                  required
                />

                <Input
                  label="Cor"
                  placeholder="Cor do produto"
                  {...register('cor')}
                  error={errors.cor?.message}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Cliente'
                  )}
                </Button>
              </div>
            </form>
          </AnimatedContainer>
        </div>
      </div>
    </>
  );
}

export default RegisterCustomer;
