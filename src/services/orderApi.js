const API_URL = 'http://localhost:8080/api/order';

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
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await fetch(`${API_URL}/${orderId}`, {
      method: 'PATCH', // Verifique se sua rota no backend é PATCH ou PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar pedido');
    }

    return data.data.order;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    throw error;
  }
};