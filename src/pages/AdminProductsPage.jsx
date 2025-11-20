// src/pages/AdminProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { ProductFormModal } from '../components/ProductFormModal';
import * as productApi from '../services/productApi'; 

export function AdminProductsPage() {
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
        const response = await productApi.updateProduct(editingProduct._id, productData);
        // Tenta extrair o produto da resposta de várias formas possíveis
        const updatedProduct = (response.data && response.data.produto) ? response.data.produto : response.data ? response.data : response;
        
        setProducts(prev => prev.map(p => 
          p._id === editingProduct._id ? updatedProduct : p
        ));
      } else {
        const response = await productApi.createProduct(productData);
        // Tenta extrair o produto da resposta de várias formas possíveis
        const newProduct = (response.data && response.data.produto) ? response.data.produto : response.data ? response.data : response;
        
        setProducts(prev => [...prev, newProduct]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status"><span className="visually-hidden">Carregando...</span></div>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center p-5 border rounded bg-light">
          <h4>Nenhum produto encontrado</h4>
          <button className="btn btn-primary mt-3" onClick={handleAddNew}>+ Adicionar Produto</button>
        </div>
      );
    }

    return (
      <div className="row g-4">
        {products.map(product => (
          <div key={product._id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0">
              
              {/* 👇 ZONA DA IMAGEM (Isto é o que faltava ou estava errado) */}
              <div 
                className="card-img-top d-flex align-items-center justify-content-center bg-light overflow-hidden" 
                style={{ height: '200px', position: 'relative' }}
              >
                {/* Verifica se product.image existe e renderiza a tag <img> */}
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-100 h-100" 
                    style={{ objectFit: 'cover' }} 
                  />
                ) : (
                  // Se não tiver imagem, mostra um ícone cinzento
                  <i className="bi bi-image" style={{ fontSize: '3rem', color: '#aaa' }}></i>
                )}
              </div>
              {/* 👆 FIM DA ZONA DA IMAGEM */}

              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between">
                  <h5 className="card-title">{product.name}</h5>
                  <span className={`badge ${product.isAvailable ? 'bg-success' : 'bg-secondary'}`} style={{width:'90px', height:'20px'}}>
                    {product.isAvailable ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                
                {/* Descrição com flex-grow para empurrar o resto para baixo */}
                <p className="card-text text-muted flex-grow-1">{product.description || "Sem descrição"}</p>
                
                <div>
                  <h4 className="mb-3">R$ {product.price ? product.price.toFixed(2) : '0.00'}</h4>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" type="checkbox" role="switch"
                        id={`switch-${product._id}`}
                        checked={product.isAvailable}
                        onChange={() => handleToggleAvailable(product)}
                      />
                      <label className="form-check-label" htmlFor={`switch-${product._id}`}>Ativar</label>
                    </div>
                    
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(product)}>
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product._id)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
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
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h2 className="mb-0">Gestão de Produtos</h2>
        <button className="btn btn-primary btn-lg" onClick={handleAddNew}>
          <i className="bi bi-plus-lg me-1"></i> Adicionar Produto
        </button>
      </div>
      {renderContent()}
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