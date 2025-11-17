// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';

// Importe suas páginas
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { WelcomePage } from '../pages/WelcomePages';
import { AdminProductsPage } from '../pages/AdminProductsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/Admin" element={<AdminProductsPage/>} />

      {/* Rota 404 */}
      <Route path="*" element={<h1>Página Não Encontrada</h1>} />
    </Routes>
  );
}