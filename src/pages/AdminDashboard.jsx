import React, { useState, useEffect } from 'react';
import { getMonthlyReport, formatMonthKey } from '../services/relatorioAPI';

export function AdminDashboardPage() {
  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);
  
  // Input de mês (Padrão: Mês atual no formato YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Estado dos dados do dashboard
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    stats: { totalRevenue: 0, count: 0, ticketMedio: 0 }
  });

  // Busca os dados sempre que o mês muda
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getMonthlyReport(selectedMonth);
        setDashboardData(data);
      } catch (error) {
        console.error("Erro no dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedMonth]);

  // Função para formatar dinheiro (R$)
  const formatMoney = (value) => {
    return Number(value).toFixed(2).replace('.', ',');
  };

  const { stats, orders } = dashboardData;

  // --- Renderização de Loading ---
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
          <p className="text-muted mb-0">
            Relatório de {formatMonthKey(selectedMonth).replace('-', ' de ')}
          </p>
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
              <h6 className="text-muted text-uppercase small fw-bold">Faturamento</h6>
              <h2 className="text-success fw-bold mb-0">
                R$ {formatMoney(stats.totalRevenue)}
              </h2>
              <small className="text-muted">Total consolidado do mês</small>
            </div>
          </div>
        </div>

        {/* Quantidade */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-primary border-5">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Pedidos Realizados</h6>
              <h2 className="text-primary fw-bold mb-0">
                {stats.count}
              </h2>
              <small className="text-muted">Entregas no período</small>
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100 border-start border-warning border-5">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small fw-bold">Ticket Médio</h6>
              <h2 className="text-dark fw-bold mb-0">
                R$ {formatMoney(stats.ticketMedio)}
              </h2>
              <small className="text-muted">Valor médio por pedido</small>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABELA DETALHADA --- */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Extrato de Vendas</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Data/Hora</th>
                  <th>Cliente</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th className="text-end">Valor</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(order => (
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
                        R$ {formatMoney(order.totalAmount || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                      Nenhum registro encontrado para este mês.
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