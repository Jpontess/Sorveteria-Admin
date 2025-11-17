// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { signup } from '../services/authAPI';

// Para a máscara, você precisará de: npm install react-input-mask
// import InputMask from 'react-input-mask';

export function SignupPage() {
  const navigate = useNavigate();
  const [msgError, setMsgError] = useState('');
  const [canSubmit, setCanSubmit] = useState(true);

  const [formData, setFormData] = useState({
    userName: '',
    userPhone: '',
    storeName: '',
    userEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setMsgError('');
    setCanSubmit(false);

    try {
      // 1. Chame sua API de cadastro
      await signup(formData);
      console.log('Dados do Cadastro:', formData);

      // 2. Se for sucesso, navegue para o Welcome
      // Passando o nome da loja via 'state' do roteador
      navigate('/welcome', { 
        state: { storeName: formData.storeName } 
      });

    } catch (error) {
      setMsgError('Erro ao criar conta. Tente novamente: ', error.message);
      setCanSubmit(true);
    }
  };

  return (
    <div className="account">
      <div className="form-signin">
        <Logo />

        <form className="signin" onSubmit={handleSignupSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              name="userName"
              required
              minLength="3"
              maxLength="60"
              placeholder="Seu nome"
              value={formData.userName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            {/* Se instalar o react-input-mask:
              <InputMask
                mask="(99) 9 9999-9999"
                value={formData.userPhone}
                onChange={handleChange}
              >
                {(inputProps) => <input {...inputProps} type="tel" className="form-control" name="userPhone" required placeholder="(00) 9 0000 0000" />}
              </InputMask>
            */}
            <input
              type="tel"
              className="form-control"
              placeholder="(00) 9 0000 0000"
              name="userPhone"
              required
              value={formData.userPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div className="input-group">
              
              <input
                type="text"
                className="form-control"
                placeholder="@nomedasualoja"
                name="storeName"
                pattern="^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$"
                required
                value={formData.storeName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder="E-mail"
              name="userEmail"
              required
              value={formData.userEmail}
              onChange={handleChange}
              pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            />
          </div>

          <div className="invalid-msg text-center">
            <span> {msgError} </span>
          </div>

          <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={!canSubmit}>
            Criar
          </button>
        </form>

        <div className="singup d-flex justify-content-center">
          <div className="signup">
            <Link to="/login" className="text-primary">
              Já tem conta? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}