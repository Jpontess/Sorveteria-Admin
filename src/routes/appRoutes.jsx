import { Routes, Route, Link, useLocation } from 'react-router-dom';

import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { WelcomePage } from '../pages/WelcomePages';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { AdminOrdersPage } from '../pages/AdminOrdersPage';
// 1. Importar a nova página
import { AdminDashboardPage } from '../pages/AdminDashboard';

function AdminLayout({ children }) {
  const location = useLocation();
  if (['/login', '/signup', '/welcome', '/'].includes(location.pathname)) {
      return children;
  }

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
        <div className="container">
          <span className="navbar-brand fw-bold">
          Administrador
          </span>
          <div className="navbar-nav">
            {/* 2. Adicionar Link no Menu */}
            <Link className="nav-link" to="/admin/dashboard">
                <i className="bi bi-graph-up me-1"></i> Relatórios
            </Link>
            <Link className="nav-link" to="/admin/orders">Pedidos</Link>
            <Link className="nav-link" to="/admin/products">Produtos</Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}

export function AppRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Rotas do Admin */}
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        {/* 3. Adicionar a Rota */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        <Route path="*" element={<h1>Página Não Encontrada</h1>} />
      </Routes>
    </AdminLayout>
  );
}