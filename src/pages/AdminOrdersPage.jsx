import React, { useState, useEffect, useRef } from 'react';
import QRCode from "react-qr-code";
import { socket } from '../services/socketioApi';
import { getOrders, updateOrderStatus } from '../services/orderApi';

const AUDIO_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

// --- CONFIGURAÇÃO: ENDEREÇO DA SUA LOJA ---
const STORE_ADDRESS = "Rua Andréia, 12, Barueri - São Paulo"; 

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Todos'); 
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // Estados para o Modal de Entrega
  const [deliveryModal, setDeliveryModal] = useState({ open: false, order: null });
  const [deliveryFee, setDeliveryFee] = useState('');
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(new Audio(AUDIO_URL));

  // --- CARREGAMENTO DE PEDIDOS E SOCKET ---
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

  // --- HELPERS (Endereço, Links, Badge) ---
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

  const getUberLink = (clientAddress) => {
    const pickup = encodeURIComponent(STORE_ADDRESS);
    const dropoff = encodeURIComponent(clientAddress);
    return `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${pickup}&dropoff[formatted_address]=${dropoff}`;
  };

  const copyAddressToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  // --- LÓGICA DO MODAL ---
  const handleOpenAcceptModal = (order) => {
    setDeliveryModal({ open: true, order: order });
    setDeliveryFee('');
    setCopied(false);
  };

  const handleCloseModal = () => {
    setDeliveryModal({ open: false, order: null });
  };

  // --- AÇÃO PRINCIPAL: CONFIRMAR E ENVIAR ZAP ---
  const confirmAcceptance = async () => {
    const { order } = deliveryModal;
    if (!order) return;

    // Converte vírgula para ponto
    const feeValue = parseFloat(deliveryFee.replace(',', '.'));
    
    if (isNaN(feeValue)) {
      alert("Por favor, digite um valor válido para a entrega (ex: 10,00).");
      return;
    }

    try {
        // 1. Muda status para Em Preparo
        const updatedOrder = await updateOrderStatus(order._id, 'Em Preparo');
        setOrders(prevOrders => prevOrders.map(o => o._id === order._id ? updatedOrder : o));

        // 2. Calcula totais
        const totalOrder = order.totalAmount || 0;
        const totalFinal = totalOrder + feeValue;
        
        const phone = order.customerPhone.replace(/\D/g, '');
        const targetPhone = phone.length <= 11 ? `55${phone}` : phone;
        const orderIdShort = order._id.slice(-6).toUpperCase();

        // 3. Monta mensagem
        const message = `*Pedido Pendente! (#${orderIdShort})* \n\n` +
                        `Olá *${order.customerName}*, podemos começar a preparar o pedido?? 👨‍🍳\n\n` +
                        `*Resumo de Valores:*\n` +
                        `Pedido: R$ ${totalOrder.toFixed(2).replace('.', ',')}\n` +
                        `Entrega: R$ ${feeValue.toFixed(2).replace('.', ',')}\n` +
                        `-------------------\n` +
                        `*TOTAL: R$ ${totalFinal.toFixed(2).replace('.', ',')}*\n\n` +
                        `Pedimos que envie o comprovante de pagamento para agilizarmos a sua entrega!`;

        // 4. Envia
        window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
        handleCloseModal();

    } catch (error) {
        alert("Erro ao atualizar pedido: " + error.message);
    }
  };

  // --- LÓGICA DE STATUS ANTIGA (Para outros botões) ---
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
    
    let messageBody = "";
    switch (order.status) {
      case 'Em Preparo':
        messageBody = `✅ *Pedido Aceito!* \nO seu pedido *#${orderIdShort}* já está sendo preparado. 👨‍🍳`;
        break;
      case 'Pronto para Entrega':
        messageBody = `🛵 *Saiu para Entrega!* \nO pedido *#${orderIdShort}* já está a caminho.`;
        break;
      case 'Concluído':
        messageBody = `🎉 *Pedido Entregue!* \nObrigado pela preferência!`;
        break;
      case 'Cancelado':
        messageBody = `❌ *Pedido Cancelado* \nHouve um problema com o pedido *#${orderIdShort}*.`;
        break;
      default:
        messageBody = `Olá! Atualização sobre o pedido *#${orderIdShort}*: ${order.status}`;
    }

    const fullMessage = `Olá *${order.customerName}*, aqui é da Sorvesan!\n\n${messageBody}`;
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

  // Filtro
  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'Todos') return true;
    return order.status === filterStatus;
  });

  return (
    <div className="container mt-4 mb-5 position-relative">
      
      {/* ================= MODAL ================= */}
      {deliveryModal.open && deliveryModal.order && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ maxWidth: '650px', width: '95%' }}>
            
            <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
              <span><i className="bi bi-bicycle me-2"></i> Cotar Entrega</span>
              <button className="btn-close btn-close-white" onClick={handleCloseModal}></button>
            </div>
            
            <div className="card-body">
              <div className="alert alert-light border text-center mb-3 py-2">
                <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Destino</small><br/>
                <span className="fw-bold text-dark">{formatAddress(deliveryModal.order.address)}</span>
              </div>

              <div className="row text-center mb-4">
                {/* UBER */}
                <div className="col-6 border-end">
                  <h6 className="fw-bold text-dark mb-2"><i className="bi bi-car-front-fill"></i> Uber Flash</h6>
                  <div className="p-2 border rounded d-inline-block bg-white shadow-sm">
                    <QRCode 
                        value={getUberLink(formatAddress(deliveryModal.order.address))} 
                        size={110} 
                    />
                  </div>
                  <div className="mt-2 text-success" style={{fontSize: '11px'}}>
                     <i className="bi bi-camera"></i> Apalher para ler
                  </div>
                </div>

                {/* 99 (Manual) */}
                <div className="col-6">
                  <h6 className="fw-bold text-warning mb-2" style={{filter: 'brightness(0.8)'}}><i className="bi bi-taxi-front-fill"></i> 99 Entrega</h6>
                  
                  <div className="d-flex flex-column justify-content-center h-100 px-2">
                    <p className="small text-muted mb-2" style={{lineHeight: '1.2'}}>
                        Copie o endereço e cole no app da 99.
                    </p>
                    
                    <button 
                        className={`btn btn-sm fw-bold mb-2 ${copied ? 'btn-success' : 'btn-outline-dark'}`} 
                        onClick={() => copyAddressToClipboard(formatAddress(deliveryModal.order.address))}>
                       {copied ? <span><i className="bi bi-check-lg"></i> Copiado!</span> : <span><i className="bi bi-clipboard"></i> Copiar</span>}
                    </button>
                    
                    <a href="https://99app.com/" target="_blank" rel="noreferrer" className="text-decoration-none small text-muted">
                        <i className="bi bi-box-arrow-up-right"></i> Abrir Site 99
                    </a>
                  </div>
                </div>
              </div>

              <hr className="my-3"/>

              <div className="mb-3">
                 <label className="form-label fw-bold text-dark">Qual o valor final da entrega?</label>
                 <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-success text-success fw-bold">R$</span>
                    <input 
                        type="number" 
                        className="form-control fw-bold fs-4 text-success border-success" 
                        placeholder="0,00"
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(e.target.value)}
                        autoFocus
                    />
                 </div>
                 <div className="d-flex justify-content-between mt-2 px-1">
                    <small className="text-muted">Pedido: R$ {(deliveryModal.order.totalAmount || 0).toFixed(2)}</small>
                    <small className="fw-bold text-dark">Total Cliente: R$ {( (deliveryModal.order.totalAmount || 0) + (parseFloat(deliveryFee.replace(',', '.')) || 0) ).toFixed(2).replace('.', ',')}</small>
                 </div>
              </div>

              <div className="d-grid">
                <button className="btn btn-success btn-lg fw-bold" onClick={confirmAcceptance}>
                   <i className="bi bi-whatsapp me-2"></i> Confirmar e Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ================= DASHBOARD ================= */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 bg-white rounded shadow-sm">
        <div className="mb-3 mb-md-0">
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            Monitor de Pedidos
          </h2>
          <p className="text-muted mb-0">
             Mostrando <strong>{filteredOrders.length}</strong> pedidos
             {filterStatus !== 'Todos' && <span> (Filtro: {filterStatus})</span>}
          </p>
        </div>
        
        <div className="d-flex gap-2 align-items-center flex-wrap">
          
          <div className="input-group" style={{ maxWidth: '250px' }}>
            <span className="input-group-text bg-light"><i className="bi bi-funnel"></i></span>
            <select 
                className="form-select fw-bold" 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="Todos">Todos os Pedidos</option>
                <option value="Pendente">⏳ Pendentes</option>
                <option value="Em Preparo">🔥 Em Preparo</option>
                <option value="Pronto para Entrega">🚲 Pronto p/ Entrega</option>
                <option value="Concluído">✅ Concluídos</option>
                <option value="Cancelado">❌ Cancelados</option>
            </select>
          </div>

          <button className="btn btn-light border" onClick={testarSom} title="Testar Som">
            <i className="bi bi-volume-up-fill"></i>
          </button>
          
          <div className={`d-flex align-items-center px-3 py-2 rounded ${isConnected ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
            <i className={`bi bi-circle-fill me-2 small ${isConnected ? 'blink' : ''}`}></i>
            <span className="fw-bold d-none d-sm-inline">{isConnected ? 'Ao Vivo' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredOrders.map(order => (
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
                        <i className="bi bi-whatsapp me-1"></i> Avisar Cliente
                    </button>

                    {order.status === 'Pendente' && (
                        <div className="d-flex gap-2">
                            {/* BOTÃO QUE ABRE O MODAL */}
                            <button className="btn btn-success flex-grow-1 fw-bold" onClick={() => handleOpenAcceptModal(order)}>
                                <i className="bi bi-check-lg me-1"></i> Aceitar
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => {
                                if(window.confirm("Cancelar este pedido?")) handleStatusChange(order._id, 'Cancelado')
                            }}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    )}

                    {order.status === 'Em Preparo' && (
                        <button className="btn btn-primary fw-bold" onClick={() => handleStatusChange(order._id, 'Pronto para Entrega')}>
                            <i className="bi bi-bicycle me-1"></i> Enviar para Entrega
                        </button>
                    )}

                    {order.status === 'Pronto para Entrega' && (
                        <button className="btn btn-secondary" onClick={() => handleStatusChange(order._id, 'Concluído')}>
                            <i className="bi bi-check2-all me-1"></i> Finalizar
                        </button>
                    )}
                    
                    <select 
                        className="form-select form-select-sm mt-1"
                        value="" 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="" disabled>Mudar status manualmente...</option>
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

        {filteredOrders.length === 0 && (
          <div className="col-12 text-center mt-5 text-muted">
            <i className="bi bi-filter fs-1"></i>
            <h4 className="mt-3">Nenhum pedido encontrado neste filtro</h4>
          </div>
        )}
      </div>
    </div>
  );
}