import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socketioApi';
import { getOrders, updateOrderStatus } from '../services/orderApi';

const AUDIO_URL = 'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const audioRef = useRef(new Audio(AUDIO_URL));

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        setOrders([]);
      }
    };
    loadOrders();

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect(reason) {
      setIsConnected(false);
      if (reason === "io server disconnect") {
        setTimeout(() => socket.connect(), 5000);
      }
    }

    function onNewOrder(newOrder) {
      try {
        audioRef.current.currentTime = 0; 
        audioRef.current.play().catch(() => {});
      } catch (e) {
        console.log(e.message);
        
      }
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    }

    function onOrderUpdated(updatedOrder) {
        setOrders(prevOrders => 
            prevOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
        );
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_order', onNewOrder);
    socket.on('order_updated', onOrderUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_order', onNewOrder);
      socket.off('order_updated', onOrderUpdated);
    };
  }, []);

  const testarSom = () => {
    audioRef.current.play().catch(e => alert("Erro ao tocar som.", e.message));
  };

  const handleStatusChange = async (orderId, newStatus) => {
      try {
          const updatedOrder = await updateOrderStatus(orderId, newStatus);
          setOrders(prevOrders => 
            prevOrders.map(o => o._id === orderId ? updatedOrder : o)
          );
      } catch (error) {
          alert("Erro ao atualizar: " + error.message);
      }
  };

  const sendWhatsAppMessage = (order) => {
    if (!order.customerPhone) return;
    const phone = order.customerPhone.replace(/\D/g, '');
    const orderIdShort = order._id.slice(-6).toUpperCase();
    const targetPhone = phone.length <= 11 ? `55${phone}` : phone;
    const message = `Olá *${order.customerName}*, atualização do pedido *#${orderIdShort}*: ${order.status}`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Função para formatar o endereço (evita erro de objeto)
  const formatAddress = (addressData) => {
    if (!addressData) return 'Endereço não informado';
    if (typeof addressData === 'string') return addressData;
    const { rua, numero, complemento, bairro, cidade } = addressData;
    let formatted = `${rua || ''}, ${numero || 'S/N'}`;
    if (complemento) formatted += ` - ${complemento}`;
    if (bairro) formatted += ` - ${bairro}`;
    if (cidade) formatted += `, ${cidade}`;
    return formatted;
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'Pendente': return <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i> Pendente</span>;
      case 'Em Preparo': return <span className="badge bg-info text-dark"><i className="bi bi-fire me-1"></i> Em Preparo</span>;
      case 'Pronto para Entrega': return <span className="badge bg-primary"><i className="bi bi-bicycle me-1"></i> Pronto p/ Entrega</span>;
      case 'Concluído': return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i> Concluído</span>;
      case 'Cancelado': return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i> Cancelado</span>;
      default: return <span className="badge bg-secondary">{status || 'Desconhecido'}</span>;
    }
  };

  const getBorderClass = (status) => {
    if (status === 'Pendente') return 'border-warning border-2';
    if (status === 'Pronto para Entrega') return 'border-primary border-2';
    if (status === 'Cancelado') return 'border-danger border-1 opacity-75';
    return 'border-0';
  };

  return (
    <div className="container mt-4 mb-5">
      
      {/* --- CABEÇALHO RESTAURADO (Aqui usamos isConnected e testarSom) --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 bg-white rounded shadow-sm">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Monitor de Pedidos
          </h2>
          <p className="text-muted mb-0">Gerencie os pedidos em tempo real.</p>
        </div>
        
        <div className="d-flex gap-2 align-items-center mt-3 mt-md-0">
          <button className="btn btn-light border" onClick={testarSom}>
            <i className="bi bi-volume-up-fill me-1"></i> Som
          </button>
          
          <div className={`d-flex align-items-center px-3 py-2 rounded ${isConnected ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
            <i className={`bi bi-circle-fill me-2 small ${isConnected ? 'blink' : ''}`}></i>
            <span className="fw-bold">{isConnected ? 'Ao Vivo' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {orders.map(order => (
          <div key={order._id} className="col-12 col-lg-6 col-xl-4">
            <div className={`card shadow-sm h-100 ${getBorderClass(order.status)}`}>
              
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <div>
                  <span className="text-muted small">#{order._id ? order._id.slice(-6).toUpperCase() : '???'}</span>
                  <h5 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '180px' }}>{order.customerName || 'Cliente'}</h5>
                </div>
                {renderStatusBadge(order.status)}
              </div>

              <div className="card-body">
                <div className="bg-light rounded p-2 mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <ul className="list-unstyled mb-0">
                    {order.items && order.items.map((item, idx) => (
                      <li key={idx} className="d-flex justify-content-between border-bottom border-white py-1">
                        <span><span className="fw-bold">{item.quantity}x</span> {item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <small className="text-muted d-block"><i className="bi bi-credit-card me-1"></i> {order.paymentMethod || 'N/A'}</small>
                    <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }} title={typeof order.address === 'string' ? order.address : 'Detalhes do endereço'}>
                      <i className="bi bi-geo-alt me-1"></i> 
                      {formatAddress(order.address)}
                    </small>
                  </div>
                  <div className="text-end">
                    <span className="d-block small text-muted">Total</span>
                    <h4 className="text-success fw-bold mb-0">
                      R$ {order.totalAmount ? order.totalAmount.toFixed(2).replace('.', ',') : '0,00'}
                    </h4>
                  </div>
                </div>
              </div>
              
              <div className="card-footer bg-white py-3">
                 <div className="d-grid gap-2">
                    <button className="btn btn-outline-success btn-sm" onClick={() => sendWhatsAppMessage(order)}>
                        <i className="bi bi-whatsapp me-1"></i> Avisar
                    </button>
                    
                    <select 
                        className="form-select form-select-sm"
                        value="" 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="" disabled>Mudar status...</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Em Preparo">Em Preparo</option>
                        <option value="Pronto para Entrega">Pronto para Entrega</option>
                        <option value="Concluído">Concluído</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                 </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}