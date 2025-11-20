import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function LoginPage() {
  const navigate = useNavigate();
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
      console.log('Dados do Login:', formData);
      
      // Simulação de Login bem-sucedido
      // Numa app real, aqui viria a chamada à API de autenticação
      
      // Redireciona para o Dashboard de Pedidos
      navigate('/admin/orders'); 

    } catch (err) {
      setMsgError(err.message);
      setCanSubmit(true);
    }
  };

  return (
    // 👇 ADICIONEI A CLASSE 'auth-wrapper' AQUI
    <div className="auth-wrapper">
      <div className="account">
        <div className="form-signin">
          <Logo />
          
          <form className="signin" onSubmit={handleLoginSubmit}>
            <div className="mb-3">
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="E-mail"
              name="userEmail"
              required
              autoFocus
              value={formData.userEmail}
              onChange={handleChange}
              pattern="^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            />
            </div>

            <div className="mb-3">
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Senha"
              name="userPwd"
              required
              value={formData.userPwd}
              onChange={handleChange}
            />
            </div>

            <div className="invalid-msg text-center">
              <span> {msgError} </span>
            </div>

            <button className="btn btn-lg btn-primary btn-block w-100 mt-3" type="submit" disabled={!canSubmit}>
              Login
            </button>
          </form>

          <div className="singup d-flex justify-content-center mt-3">
            <div className="signup">
              <span>
                Novo por aqui?{' '}
                <Link to="/signup" className="text-primary text-decoration-none">
                  Crie sua conta
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}