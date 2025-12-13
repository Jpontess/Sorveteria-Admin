// src/components/ProductFormModal.jsx
import React, { useState } from 'react';

// Estado inicial do formulário em branco
const defaultFormState = {
  name: '',
  description: '',
  price: 0,
  image: '', // Pode ser URL ou Base64 (Upload)
  isAvailable: true,
};

export function ProductFormModal({ isOpen, onClose, onSave, product }) {
  
  const isEditing = product != null;
  const title = isEditing ? "Editar Produto" : "Adicionar Novo Produto";

  const [formData, setFormData] = useState(
    isEditing ? { ...defaultFormState, ...product } : defaultFormState
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue;
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'number') {
      finalValue = parseFloat(value);
    } else {
      finalValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // Função de Upload (Base64) - Mantida como alternativa
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande! Tente uma menor que 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            
            <div className="modal-body">
              {/* Preview da Imagem */}
              {formData.image && (
                <div className="mb-3 text-center position-relative">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '150px' }} 
                  />
                </div>
              )}

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
                <label className="form-label">Imagem do Produto</label>
                
                {/* Campo para Link */}
                <input
                  type="url"
                  className="form-control mb-2"
                  id="image"
                  name="image"
                  placeholder="Cole o link da imagem (http://...)"
                  value={formData.image || ''}
                  onChange={handleChange}
                />
                
                <div className="text-center text-muted small mb-2">- OU -</div>

                {/* Campo para Upload (Base64) */}
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleFileChange} 
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
              <div className='mb-3'>
                <label htmlFor='category' className='form-label'>Categoria</label>
                  <input 
                    type="text"
                    className='form-control'
                    id='category'
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                  />
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