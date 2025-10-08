import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { formSchema, FormData } from '../schemas/registerSchema';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { maskPhone } from '../utils/formatPhone';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Navigation from '../components/ui/Navigation';
import '../styles/pages.css';

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
      await addDoc(collection(db, 'clientes'), {
        ...data,
        referencia: data.referencia.toLowerCase(),
        modelo: data.modelo.toLowerCase(),
        dataCriacao: new Date().toISOString(),
      });

      alert('Cliente salvo com sucesso!');
      reset();
    } catch (error) {
      // Traduz erro e mostra na tela
      const message = getFirebaseErrorMessage(error);
      setErrorMessage(message);
      console.error('Erro ao salvar cliente:', error);
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Reserva de <span className="text-blue-600">Cliente</span>
            </h1>
            <p className="text-gray-600 text-lg">Produto fora de estoque? Registre aqui</p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
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
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    'Salvar Cliente'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterCustomer;
