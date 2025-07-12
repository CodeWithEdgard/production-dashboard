// src/components/OrderFormModal.jsx

import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

// Estilos customizados para o Modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '500px',
    padding: '2rem'
  },
};

// Vincula o modal ao elemento raiz do nosso app para acessibilidade
Modal.setAppElement('#root');

const API_URL = "http://127.0.0.1:8000";

function OrderFormModal({ modalIsOpen, closeModal, onOrderAdded }) {
  const [formData, setFormData] = useState({
    obra_number: '',
    nro_op: '',
    // Adicione os outros campos de status aqui, se desejar valores padrão diferentes
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(`${API_URL}/orders/`, formData);
      alert('Ordem criada com sucesso!');
      onOrderAdded(); // "Avisa" o componente pai que uma nova ordem foi criada
      closeModal();   // Fecha o modal
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Falha ao criar a ordem.';
      setError(errorMsg);
      console.error('Erro ao criar ordem:', err);
    }
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Formulário de Nova Ordem"
    >
      <h2>Adicionar Nova Ordem de Produção</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>Nº da Obra:</label>
          <input type="text" name="obra_number" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>NRO OP:</label>
          <input type="text" name="nro_op" onChange={handleChange} required />
        </div>
        
        {/* Adicione outros campos necessários aqui */}
        {/* Exemplo: */}
        <div className="form-group">
            <label>Descrição:</label>
            <input type="text" name="descricao" onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="submit" className="button-primary">Salvar</button>
          <button type="button" onClick={closeModal} className="button-secondary">Cancelar</button>
        </div>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </Modal>
  );
}

export default OrderFormModal;