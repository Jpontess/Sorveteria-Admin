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
        console.log(e.message)
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

  // 👇 NOVA FUNÇÃO: Gera a mensagem e abre o WhatsApp
  const sendWhatsAppMessage = (order) => {
    if (!order.customerPhone) {
      alert("Este pedido não tem telefone cadastrado.");
      return;
    }

    // Remove caracteres não numéricos do telefone
    const phone = order.customerPhone.replace(/\D/g, '');
    const orderIdShort = order._id.slice(-6).toUpperCase();
    let messageBody = "";

    // Mensagens personalizadas por status
    switch (order.status) {
      case 'Em Preparo':
        messageBody = `✅ *Pedido Aceito!* \nO seu pedido *#${orderIdShort}* já está sendo preparado com muito carinho. 👨‍🍳🍦`;
        break;
      case 'Pronto para Entrega':
        messageBody = `🛵 *Saiu para Entrega!* \nO pedido *#${orderIdShort}* já está a caminho do seu endereço.`;
        break;
      case 'Concluído':
        messageBody = `🎉 *Pedido Entregue!* \nEsperamos que goste do sorvete! Obrigado pela preferência.`;
        break;
      case 'Cancelado':
        messageBody = `❌ *Atualização do Pedido* \nInfelizmente o pedido *#${orderIdShort}* precisou ser cancelado.`;
        break;
      case 'Pendente':
      default:
        messageBody = `Olá! Estamos verificando o seu pedido *#${orderIdShort}*.`;
        break;
    }

    // Adiciona saudação e assinatura
    const fullMessage = `Olá *${order.customerName}*, aqui é da Sorvesan!\n\n${messageBody}`;
    
    // Abre o WhatsApp (Web ou App)
    // Assumindo código do país 55 (Brasil) se não tiver
    const targetPhone = phone.length <= 11 ? `55${phone}` : phone;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(fullMessage)}`, '_blank');
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
                  <h5 className="mb-0 fw-bold text-truncate" style={{ maxWidth: '180px' }}>{order.customerName || 'Cliente Desconhecido'}</h5>
                </div>
                {renderStatusBadge(order.status)}
              </div>

              <div className="card-body">
                <div className="bg-light rounded p-2 mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <ul className="list-unstyled mb-0">
                    {order.items && Array.isArray(order.items) ? (
                        order.items.map((item, idx) => (
                        <li key={idx} className="d-flex justify-content-between border-bottom border-white py-1">
                            <span><span className="fw-bold">{item.quantity}x</span> {item.name}</span>
                        </li>
                        ))
                    ) : (
                        <li className="text-muted small">Sem itens listados</li>
                    )}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-end">
                  <div>
                    <small className="text-muted d-block"><i className="bi bi-credit-card me-1"></i> {order.paymentMethod || 'N/A'}</small>
                    <small className="text-muted d-block text-truncate" style={{ maxWidth: '200px' }} title={order.address}>
                      <i className="bi bi-geo-alt me-1"></i> {order.address || 'Sem endereço'}
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
                 <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </small>
                    
                    {/* 👇 BOTÃO WHATSAPP NOVO */}
                    <button 
                      className="btn btn-outline-success btn-sm" 
                      onClick={() => sendWhatsAppMessage(order)}
                      title="Enviar mensagem no WhatsApp"
                    >
                      <i className="bi bi-whatsapp me-1"></i> Avisar Cliente
                    </button>
                 </div>

                 <div className="d-grid gap-2">
                   {order.status === 'Pendente' ? (
                      <div className="d-flex gap-2">
                        <button 
                            className="btn btn-success flex-grow-1 fw-bold"
                            onClick={() => handleStatusChange(order._id, 'Em Preparo')}
                        >
                            <i className="bi bi-check-lg me-1"></i> Aceitar
                        </button>
                        <button 
                            className="btn btn-outline-danger"
                            title="Recusar Pedido"
                            onClick={() => {
                              if(window.confirm("Tem certeza que deseja cancelar este pedido?")) 
                                handleStatusChange(order._id, 'Cancelado')
                            }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                   ) : (
                     order.status !== 'Concluído' && order.status !== 'Cancelado' && (
                        <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                const next = order.status === 'Em Preparo' ? 'Pronto para Entrega' : 'Concluído';
                                handleStatusChange(order._id, next);
                            }}
                        >
                            Avançar Status <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                     )
                   )}

                   <div className="input-group input-group-sm mt-2">
                      <label className="input-group-text bg-light text-muted">Mudar para:</label>
                      <select 
                        className="form-select"
                        value="" 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="" disabled>Selecionar...</option>
                        <option value="Pendente">⏳ Pendente</option>
                        <option value="Em Preparo">🔥 Em Preparo</option>
                        <option value="Pronto para Entrega">🚲 Pronto p/ Entrega</option>
                        <option value="Concluído">✅ Concluído</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>
                   </div>

                 </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-12 text-center mt-5 text-muted">
            <i className="bi bi-inbox fs-1"></i>
            <h4 className="mt-3">Nenhum pedido na fila</h4>
          </div>
        )}
      </div>
    </div>
  );
}