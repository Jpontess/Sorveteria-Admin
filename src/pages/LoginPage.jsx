import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { login } from '../services/authAPI'; // 1. Importar o serviço

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
      // 2. Chamar a API de Login
      await login(formData.userEmail, formData.userPwd);
      
      // 3. Se não der erro, redirecionar para o Dashboard
      navigate('/admin/orders'); 

    } catch (err) {
      // 4. Mostrar erro vindo do backend (ex: "Senha incorreta")
      setMsgError(err.message);
      setCanSubmit(true);
    }
  };

  return (
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

            <div className="invalid-msg text-center mb-2">
              <span> {msgError} </span>
            </div>

            <button className="btn btn-lg btn-primary w-100 mt-4" type="submit" disabled={!canSubmit}>
              Login
            </button>
          </form>

          <div className="singup d-flex justify-content-center mt-4">
            <div className="signup">
              <span>
                Novo por aqui?{' '}
                <Link to="/signup" className="text-primary text-decoration-none fw-bold">
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