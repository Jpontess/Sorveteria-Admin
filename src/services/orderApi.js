const API_URL = 'https://sorveteria-backend-h7bw.onrender.com/api/order';

export const getOrders = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    // O backend retorna { status: 'Sucesso', data: { orders: [...] } }
    if (data.data && Array.isArray(data.data.orders)) {
      return data.data.orders;
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return [];
  }
};