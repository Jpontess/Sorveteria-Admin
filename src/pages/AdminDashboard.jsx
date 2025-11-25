import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/orderApi';

export function AdminDashboardPage() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para o filtro de mês (Padrão: Mês atual no formato YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Carregar pedidos ao entrar na tela
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getOrders();
        const orders = Array.isArray(data) ? data : [];
        setAllOrders(orders);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Recalcular sempre que o mês ou a lista de pedidos mudar
  useEffect(() => {
    if (allOrders.length === 0) return;

    const filtered = allOrders.filter(order => {
      // Pega os primeiros 7 caracteres da data (ex: "2025-11") e compara
      const orderDate = order.createdAt ? order.createdAt.slice(0, 7) : '';
      // Ignora pedidos cancelados na contabilidade
      const isNotCancelled = order.status !== 'Cancelado'; 
      return orderDate === selectedMonth && isNotCancelled;
    });

    setFilteredOrders(filtered);
  }, [selectedMonth, allOrders]);

  // --- CÁLCULOS MATEMÁTICOS ---
  const totalRevenue = filteredOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Removido 'ordersByStatus' pois não estava sendo usado, resolvendo o aviso do linter.

  // Exibir Loading enquanto carrega
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      
      {/* --- CABEÇALHO --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 p-4 bg-white rounded shadow-sm">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
            Dashboard Financeiro
          </h2>
          <p className="text-muted mb-0">Visão geral de vendas e performance.</p>
        </div>
        
        <div className="mt-3 mt-md-0">
          <label className="form-label small fw-bold text-muted">Selecione o Mês:</label>
          <input 
            type="month" 
            className="form-control form-control-lg fw-bold border-primary"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* --- CARTÕES DE RESUMO (KPIs) --- */}
      <div className="row g-4 mb-4">
        {/* Faturamento */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-success border-5">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Faturamento (Mês)</h6>
              <h2 className="text-success fw-bold mb-0">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </h2>
              <small className="text-muted">Vendas líquidas (sem cancelados)</small>
            </div>
          </div>
        </div>

        {/* Quantidade */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-primary border-5">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Pedidos Realizados</h6>
              <h2 className="text-primary fw-bold mb-0">
                {totalOrders}
              </h2>
              <small className="text-muted">Total de entregas no período</small>
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-warning border-5">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Ticket Médio</h6>
              <h2 className="text-dark fw-bold mb-0">
                R$ {averageTicket.toFixed(2).replace('.', ',')}
              </h2>
              <small className="text-muted">Valor médio por cliente</small>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABELA DETALHADA --- */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Extrato de Vendas - {selectedMonth}</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th className="text-end">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString()} 
                        <small className="text-muted ms-1">
                          {new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </small>
                      </td>
                      <td className="fw-bold">{order.customerName}</td>
                      <td>{order.paymentMethod}</td>
                      <td>
                        <span className={`badge bg-${order.status === 'Concluído' ? 'success' : 'secondary'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-end fw-bold text-success">
                        R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                      Nenhuma venda encontrada neste mês.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}