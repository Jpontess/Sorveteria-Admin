import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Importe as páginas
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { WelcomePage } from '../pages/WelcomePages';
import { AdminProductsPage } from '../pages/AdminProductsPage';
import { AdminOrdersPage } from '../pages/AdminOrdersPage';

// Um Navbar simples para o Admin
function AdminLayout({ children }) {
  const location = useLocation();
  // Não mostra menu no login
  if (['/login', '/signup', '/welcome', '/'].includes(location.pathname)) {
      return children;
  }

  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
        <div className="container">
          <span className="navbar-brand">Admin Loja</span>
          <div className="navbar-nav">
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

        <Route path="*" element={<h1>Página Não Encontrada</h1>} />
      </Routes>
    </AdminLayout>
  );
}