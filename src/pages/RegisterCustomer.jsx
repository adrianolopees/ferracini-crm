import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import IMask from 'imask';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import '../styles/pages.css';

function RegisterCustomer() {
  const navigate = useNavigate();
  const celularInputRef = useRef(null);
  const [formData, setFormData] = useState({
    cliente: '',
    celular: '',
    modelo: '',
    referencia: '',
    numeracao: '',
    cor: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (celularInputRef.current) {
      const maskInstance = IMask(celularInputRef.current, {
        mask: '(00) 00000-0000',
      });

      maskInstance.on('accept', () => {
        setFormData((prev) => ({ ...prev, celular: maskInstance.value }));
      });

      return () => maskInstance.destroy();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'celular') {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  const validate = () => {
    const newErrors = {};

    if (!formData.cliente.trim())
      newErrors.cliente = 'Cliente não pode estar em branco!';
    if (!formData.celular.trim())
      newErrors.celular = 'Celular não pode estar em branco!';
    else if (formData.celular.length < 15)
      newErrors.celular = 'Número incompleto!';
    if (!formData.modelo.trim())
      newErrors.modelo = 'Modelo não pode estar em branco!';
    else if (!isNaN(formData.modelo)) newErrors.modelo = 'Somente letras!';
    if (!formData.referencia.trim())
      newErrors.referencia = 'REF não pode estar em branco!';
    if (!formData.numeracao)
      newErrors.numeracao = 'Nº não pode estar em branco!';
    if (!formData.cor.trim()) newErrors.cor = 'Cor não pode estar em branco!';
    else if (!isNaN(formData.cor)) newErrors.cor = 'Somente letras!';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await addDoc(collection(db, 'clientes'), {
        ...formData,
        referencia: formData.referencia.toLowerCase(),
        modelo: formData.modelo.toLowerCase(),
        dataCriacao: new Date().toISOString(),
      });

      alert('Cliente salvo com sucesso!');
      setFormData({
        cliente: '',
        celular: '',
        modelo: '',
        referencia: '',
        numeracao: '',
        cor: '',
      });
      setErrors({});
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
        <form className="form" onSubmit={handleSubmit}>
          <Input
            label="Cliente:"
            name="cliente"
            placeholder="Nome e sobrenome"
            value={formData.cliente}
            onChange={handleChange}
            error={errors.cliente}
          />

          <Input
            label="Celular:"
            type="tel"
            name="celular"
            placeholder="(dd) 00000-0000"
            value={formData.celular}
            onChange={handleChange}
            error={errors.celular}
            ref={celularInputRef}
          />

          <Input
            label="Modelo:"
            name="modelo"
            placeholder="Nome da linha"
            value={formData.modelo}
            onChange={handleChange}
            error={errors.modelo}
          />

          <Input
            label="REF:"
            name="referencia"
            placeholder="Completa"
            value={formData.referencia}
            onChange={handleChange}
            error={errors.referencia}
          />

          <Input
            label="Nº:"
            type="number"
            name="numeracao"
            placeholder="Número"
            value={formData.numeracao}
            onChange={handleChange}
            error={errors.numeracao}
            min="37"
            max="47"
          />

          <Input
            label="Cor:"
            name="cor"
            placeholder="Cor"
            value={formData.cor}
            onChange={handleChange}
            error={errors.cor}
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
