import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import '../styles/pages.css';
import '../styles/search.css';

function SearchCustomers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setCustomers([]);
      return;
    }

    try {
      const valorBuscado = value.toLowerCase().trim();

      const refQuery = query(
        collection(db, 'clientes'),
        where('referencia', '==', valorBuscado)
      );

      const modeloQuery = query(
        collection(db, 'clientes'),
        where('modelo', '==', valorBuscado)
      );

      const [refSnapshot, modeloSnapshot] = await Promise.all([
        getDocs(refQuery),
        getDocs(modeloQuery),
      ]);

      const results = [];
      refSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      modeloSnapshot.forEach((doc) => {
        if (!results.some((customer) => customer.id === doc.id)) {
          results.push({ id: doc.id, ...doc.data() });
        }
      });

      setCustomers(results);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleWhatsApp = (customer) => {
    const mensagem = `Olá, ${customer.cliente}! Aqui é da Ferracini maxi shopping, estou entrando em contato sobre o modelo
  ${customer.modelo}, que não tinha no número ${customer.numeracao} na cor ${customer.cor}. Acabou de chegar, quer que separe pra você?`;
    const celularSomenteNumeros = customer.celular.replace(/\D/g, '');
    const urlWhatsApp = `https://wa.me/55${celularSomenteNumeros}?text=${encodeURIComponent(
      mensagem
    )}`;
    window.open(urlWhatsApp, '_blank');
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'clientes', selectedCustomer.id));
      alert(`Cliente ${selectedCustomer.cliente} excluído!`);
      setModalOpen(false);
      setSelectedCustomer(null);
      handleSearch({ target: { value: searchTerm } });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente. Tente novamente.');
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="page-container">
      <h1>
        Bus<span className="destaque">c</span>ar{' '}
        <span className="destaque">C</span>lientes
      </h1>
      <p className="subtitle">não perca venda</p>

      <div className="container buscar">
        <Input
          label="Buscar Clientes:"
          type="search"
          placeholder="modelo ou referencia"
          value={searchTerm}
          onChange={handleSearch}
        />

        <div className="resultadoDaBusca">
          {customers.length === 0 && searchTerm && (
            <p>REF ou MODELO não encontrados!</p>
          )}

          {customers.map((customer) => (
            <div key={customer.id} className="cliente-item">
              <strong>Cliente:</strong> {customer.cliente} <br />
              <strong>Celular:</strong>{' '}
              <span className="celular">{customer.celular}</span>
              <i
                className="fa-brands fa-whatsapp icon-zap"
                onClick={() => handleWhatsApp(customer)}
              ></i>
              <br />
              <strong>Modelo:</strong> {customer.modelo}
              <br />
              <strong>Referência:</strong> {customer.referencia}
              <br />
              <strong>Numeração:</strong> {customer.numeracao}
              <br />
              <strong>Cor:</strong> {customer.cor}
              <i
                className="fa-regular fa-trash-can icon-lixo"
                onClick={() => handleDeleteClick(customer)}
              ></i>
            </div>
          ))}
        </div>

        <button
          className="botao-flutuante"
          onClick={() => navigate('/register')}
        >
          <i className="bi bi-arrow-left-circle"></i>
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Você já mandou Msg pro cliente?"
      />
    </div>
  );
}

export default SearchCustomers;
