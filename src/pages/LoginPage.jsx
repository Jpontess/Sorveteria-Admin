// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import {login} from '../services/authAPI'


export function LoginPage() {
  useNavigate();
  const [msgError, setMsgError] = useState('');
  const [canSubmit, setCanSubmit] = useState(true);

  const [formData, setFormData] = useState({
    userEmail: '',
    userPwd: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMsgError('');
    setCanSubmit(false);

    try {
      // 1. Chame sua API de login aqui
      await login(formData.userEmail, formData.userPwd);
      console.log('Dados do Login:', formData);
    

      // Apenas para simulação, vamos dar um erro
      throw new Error("Email ou senha inválidos (simulação)");

    } catch (err) {
      setMsgError(err.message);
      setCanSubmit(true);
    }
  };

  return (
    <div className="account">
      <div className="form-signin">
        <Logo />
        
        <form className="signin" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            className="form-control"
            placeholder="E-mail"
            name="userEmail"
            required
            autoFocus
            value={formData.userEmail}
            onChange={handleChange}
            pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          />

          <input
            type="password"
            className="form-control"
            placeholder="Senha"
            name="userPwd"
            required
            value={formData.userPwd}
            onChange={handleChange}
          />

          <div className="invalid-msg text-center">
            <span> {msgError} </span>
          </div>

          <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={!canSubmit}>
            Login
          </button>
        </form>

        <div className="singup d-flex justify-content-center">
          <div className="signup">
            <span>
              Novo por aqui?{' '}
              <Link to="/signup" className="text-primary">
                Crie sua lista
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}