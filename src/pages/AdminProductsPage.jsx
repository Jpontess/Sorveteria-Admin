// src/pages/AdminProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { ProductFormModal } from '../components/ProductFormModal';
import * as productApi from '../services/productApi'; // API simulada

// (Já não precisamos dos ícones SVG inline se usarmos o Bootstrap Icons)

export function AdminProductsPage() {
  // (O estado e os hooks useEffect continuam iguais)
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await productApi.getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
      setIsLoading(false);
    };

    loadProducts();
  }, []);

  // --- (Os Handlers do CRUD continuam iguais) ---
  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }
    try {
      await productApi.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
    }
  };

  const handleToggleAvailable = async (product) => {
    const updatedProduct = { ...product, isAvailable: !product.isAvailable };
    try {
      await productApi.updateProduct(product._id, updatedProduct);
      setProducts(prev => prev.map(p => 
        p._id === product._id ? updatedProduct : p
      ));
    } catch (error) {
      console.error("Erro ao atualizar disponibilidade:", error);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        const updated = await productApi.updateProduct(editingProduct._id, productData);
        setProducts(prev => prev.map(p => 
          p._id === editingProduct._id ? updated : p
        ));
      } else {
        const newProduct = await productApi.createProduct(productData);
        setProducts(prev => [...prev, newProduct]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  // --- Renderização ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      );
    }

    // --- ⭐ MELHORIA: Estado Vazio ---
    if (products.length === 0) {
      return (
        <div className="text-center p-5 border rounded bg-light">
          <h4>Nenhum produto encontrado</h4>
          <p>Que tal adicionar o primeiro?</p>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + Adicionar Produto
          </button>
        </div>
      );
    }

    // --- ⭐ MELHORIA: Layout de Grelha de Cartões ---
    return (
      <div className="row g-4">
        {products.map(product => (
          <div key={product._id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                
                {/* Informações do Produto */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">{product.name}</h5>
                    {/* ⭐ MELHORIA: Selo de Status */}
                    <span className={`badge ${product.isAvailable ? 'bg-success' : 'bg-secondary'}`}>
                      {product.isAvailable ? "Disponível" : "Indisponível"}
                    </span>
                  </div>
                  <p className="card-text text-muted">{product.description || "Sem descrição"}</p>
                  <h4 className="mb-3">R$ {product.price.toFixed(2)}</h4>
                </div>

                {/* Controles */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      role="switch"
                      id={`switch-${product._id}`}
                      checked={product.isAvailable}
                      onChange={() => handleToggleAvailable(product)}
                    />
                    <label className="form-check-label" htmlFor={`switch-${product._id}`}>
                      Ativar
                    </label>
                  </div>

                  {/* ⭐ MELHORIA: Botões com Ícones */}
                  <div className="btn-group">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(product)}>
                      <i className="bi bi-pencil-fill me-1"></i> Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product._id)}>
                      <i className="bi bi-trash-fill me-1"></i> Deletar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mt-5 mb-5">
      {/* ⭐ MELHORIA: Cabeçalho da Página */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h2 className="mb-0">Gestão de Produtos</h2>
        <button className="btn btn-primary btn-lg" onClick={handleAddNew}>
          <i className="bi bi-plus-lg me-1"></i> Adicionar Produto
        </button>
      </div>

      {/* Renderiza o conteúdo (Spinner, Estado Vazio ou Grelha) */}
      {renderContent()}

      {/* O Modal de Edição/Criação (sem alterações) */}
      <ProductFormModal
        key={editingProduct ? editingProduct._id : 'new-product'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
}