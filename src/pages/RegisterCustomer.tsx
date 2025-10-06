import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { formSchema, FormData } from '../schemas/registerSchema';
import IMask from 'imask';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import '../styles/pages.css';

function RegisterCustomer() {
  const navigate = useNavigate();
  const celularInputRef = useRef<HTMLInputElement>(null);
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
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Tente novamente.');
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
          <Input
            label="Cliente:"
            placeholder="Nome e sobrenome"
            {...register('cliente')}
            error={errors.cliente?.message}
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
            required
          />

          <Input
            label="Modelo:"
            placeholder="Nome da linha"
            {...register('modelo')}
            error={errors.modelo?.message}
            required
          />

          <Input
            label="REF:"
            placeholder="Completa"
            {...register('referencia')}
            error={errors.referencia?.message}
            required
          />

          <Input
            label="Nº:"
            type="number"
            placeholder="Número"
            {...register('numeracao')}
            error={errors.numeracao?.message}
            min="37"
            max="47"
            required
          />

          <Input
            label="Cor:"
            placeholder="Cor"
            {...register('cor')}
            error={errors.cor?.message}
            required
          />

          <Button type="submit">Salvar</Button>
        </form>

        <button className="botao-flutuante" onClick={() => navigate('/search')}>
          <i className="bi bi-search"></i>
        </button>
      </div>
    </div>
  );
}

export default RegisterCustomer;
