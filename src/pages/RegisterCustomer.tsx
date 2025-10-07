import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { formSchema, FormData } from '../schemas/registerSchema';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import IMask from 'imask';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import '../styles/pages.css';

function RegisterCustomer() {
  const navigate = useNavigate();
  const celularInputRef = useRef<HTMLInputElement>(null);
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

  const { ref: celularRegisterRef, ...celularRegisterRest } =
    register('celular');

  useEffect(() => {
    if (celularInputRef.current) {
      const maskInstance = IMask(celularInputRef.current, {
        mask: '(00) 00000-0000',
      });

      maskInstance.on('accept', () => {
        setValue('celular', maskInstance.value);
      });

      return () => maskInstance.destroy();
    }
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage(''); // Limpa erro anterior

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
    <div className="page-container">
      <h1>
        Sa<span className="destaque">l</span>var Con
        <span className="destaque">t</span>a<span className="destaque">t</span>
        os
      </h1>
      <p className="subtitle">não perca venda</p>

      <div className="container cadastrar">
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {/* Mensagem de erro global */}
          {errorMessage && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee',
                color: '#c00',
                borderRadius: '4px',
                marginBottom: '16px',
              }}
            >
              {errorMessage}
            </div>
          )}

          <Input
            label="Cliente:"
            placeholder="Nome e sobrenome"
            {...register('cliente')}
            error={errors.cliente?.message}
            disabled={isLoading}
            required
          />

          <Input
            label="Celular:"
            type="tel"
            placeholder="(dd) 00000-0000"
            {...celularRegisterRest}
            ref={(e) => {
              celularRegisterRef(e);
              celularInputRef.current = e;
            }}
            error={errors.celular?.message}
            disabled={isLoading}
            required
          />

          <Input
            label="Modelo:"
            placeholder="Nome da linha"
            {...register('modelo')}
            error={errors.modelo?.message}
            disabled={isLoading}
            required
          />

          <Input
            label="REF:"
            placeholder="Completa"
            {...register('referencia')}
            error={errors.referencia?.message}
            disabled={isLoading}
            required
          />

          <Input
            label="Nº:"
            type="number"
            placeholder="Número"
            {...register('numeracao')}
            error={errors.numeracao?.message}
            disabled={isLoading}
            min="37"
            max="47"
            required
          />

          <Input
            label="Cor:"
            placeholder="Cor"
            {...register('cor')}
            error={errors.cor?.message}
            disabled={isLoading}
            required
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>

        <button className="botao-flutuante" onClick={() => navigate('/search')}>
          <i className="bi bi-search"></i>
        </button>
      </div>
    </div>
  );
}

export default RegisterCustomer;
