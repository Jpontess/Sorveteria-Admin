// src/components/ProductFormModal.jsx
import React, { useState} from 'react';

// Estado inicial do formulário em branco
const defaultFormState = {
  name: '',
  description: '',
  price: 0,
  isAvailable: true, // Por padrão, novos produtos estão disponíveis
};

export function ProductFormModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState(defaultFormState);

  // Determina o modo (Criar ou Editar)
  const isEditing = product != null;
  const title = isEditing ? "Editar Produto" : "Adicionar Novo Produto";

  // Efeito para popular o formulário quando o 'product' (para edição) mudar

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Passa os dados do formulário para o 'onSave' da página pai
    onSave(formData);
  };

  // Renderiza null se o modal não estiver aberto (melhor para performance)
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop do Modal
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nome do Produto</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Descrição</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="price" className="form-label">Preço (R$)</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Produto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}