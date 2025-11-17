// src/pages/WelcomePage.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function WelcomePage() {
  const location = useLocation();
  
  // Pega o nome da loja que foi passado pelo 'navigate'
  const storeName = location.state?.storeName || 'sua-loja';

  return (
    <div className="account">
      <div className="form-signin" style={{ textAlign: 'center' }}>
        <Logo />
        <h1>Quase lá!!!</h1>
        <p>
          Entraremos em contato para criar a sua lista online.
        </p>
        <p>
          Você poderá acessar sua lista pelo link{' '}
          <a href={`http://${storeName}.seu-dominio.com`} target="_blank" rel="noopener noreferrer">
            {storeName}.seu-dominio.com
          </a>
        </p>
        <br />
        <Link to="/login" className="text-primary">
          Voltar ao Login
        </Link>
      </div>
    </div>
  );
}