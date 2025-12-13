// src/services/productApi.js
// (Este arquivo agora usa o backend real, substituindo o localStorage)

// 1. Defina a URL base do seu backend.
const API_URL = 'https://sorveteria-backend-h7bw.onrender.com/api/products';

// --- Funções da API ---

export const getProducts = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos da API');
    }
    // Assumindo que a API do admin retorna a mesma estrutura
    const responseData = await response.json();
    
    // Verificando a estrutura: { data: { produtos: [...] } }
    if (responseData && responseData.data && Array.isArray(responseData.data.produtos)) {
      return responseData.data.produtos;
    } 
    // Adicionando fallback para outras estruturas que encontramosk
    else if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && Array.isArray(responseData.products)) {
      return responseData.products;
    } else if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    } else {
      console.error("Formato de dados inesperado no Admin!", responseData);
      return [];
    }

  } catch (error) {
    console.error(error);
    return []; // Retorna um array vazio em caso de erro
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Erro ao criar produto');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error; // Re-lança o erro para o componente (ex: modal)
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    // IMPORTANTE: A URL de update/delete precisa do ID
    const response = await fetch(`${API_URL}/${productId}`, {
      method: 'PUT', // ou 'PATCH'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Erro ao atualizar produto');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    // IMPORTANTE: A URL de update/delete precisa do ID
    const response = await fetch(`${API_URL}/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erro ao deletar produto');
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
};