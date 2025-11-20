import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socketioApi';
import { getOrders } from '../services/orderApi';

// URL de um som de notificação mais confiável (Beep simples)
const AUDIO_URL = 'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // Usamos useRef para garantir que o áudio é o mesmo
  const audioRef = useRef(new Audio(AUDIO_URL));

  useEffect(() => {
    const loadOrders = async () => {
      const data = await getOrders();
      setOrders(data);
    };
    loadOrders();

    function onConnect() {
      setIsConnected(true);
      console.log("🟢 Conectado ao Socket!");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("🔴 Desconectado do Socket");
    }

       // 👇 NOVO: Ouvir erros de conexão
    function onConnectError(error) {
      console.log("⚠️ Falha ao conectar:", error.message);
      setIsConnected(false);
    }

    function onNewOrder(newOrder) {
      console.log("🔔 NOVO PEDIDO RECEBIDO:", newOrder);
      
      // Tocar som
      try {
        // Reinicia o som caso toque vários seguidos
        audioRef.current.currentTime = 0; 
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("🚫 O navegador bloqueou o som (Autoplay Policy):", error);
            alert("Novo Pedido Recebido! (Ative o som clicando no botão)");
          });
        }
      } catch (e) {
        console.error("Erro ao tentar tocar som:", e);
      }

      setOrders(prevOrders => [newOrder, ...prevOrders]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError)
    socket.on('new_order', onNewOrder);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError)
      socket.off('new_order', onNewOrder);
    };
  }, []);

  // Função para testar e liberar o áudio no navegador
  const testarSom = () => {
    audioRef.current.play()
      .then(() => console.log("🔊 Som testado com sucesso!"))
      .catch(e => alert("Erro ao tocar som. Verifique se seu navegador permite áudio.", e));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Monitor de Pedidos</h2>
        
        <div className="d-flex gap-2 align-items-center">
          {/* Botão para desbloquear o Autoplay */}
          <button className="btn btn-outline-secondary btn-sm" onClick={testarSom}>
            <i className="bi bi-volume-up-fill me-1"></i> Testar Som
          </button>

          <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
            {isConnected ? 'Conectado (Ao Vivo)' : 'Desconectado'}
          </span>
        </div>
      </div>

      <div className="row">
        {orders.map(order => (
          <div key={order._id} className="col-12 mb-3">
            <div className={`card shadow-sm ${order.status === 'Pendente' ? 'border-warning' : ''}`}>
              <div className="card-header d-flex justify-content-between align-items-center bg-white">
                <strong>#{order._id.slice(-6)} - {order.customerName}</strong>
                <span className={`badge ${order.status === 'Pendente' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                  {order.status}
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <ul className="list-unstyled mb-0">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-md-4 text-end">
                    <h5 className="text-success mb-1">R$ {order.totalAmount.toFixed(2).replace('.', ',')}</h5>
                    <small className="text-muted">{order.paymentMethod}</small>
                    <p className="mb-0 mt-2"><strong>Entrega:</strong> {order.address}</p>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-light text-end">
                 <small className="text-muted me-3">
                    {new Date(order.createdAt).toLocaleString()}
                 </small>
                 <button className="btn btn-primary btn-sm">Aceitar Pedido</button>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center mt-5 text-muted">
            <h4>Nenhum pedido por enquanto...</h4>
            <p>Aguardando novas vendas.</p>
          </div>
        )}
      </div>
    </div>
  );
}