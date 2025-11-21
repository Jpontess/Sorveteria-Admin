import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

// 👇 CORREÇÃO AQUI: Mudamos de 'signup' para 'register'
// O arquivo authApi.js exporta "register", então temos de importar "register".
import { register } from '../services/authAPI'; 

export function SignupPage() {
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setMsgError('');
    setCanSubmit(false);

    try {
      // 2. Chamar a função 'register' (que antes estava a dar erro como 'signup')
      await register(formData.userEmail, formData.userPwd);

      // 3. Sucesso!
      alert('Conta criada com sucesso! Faça login.');
      navigate('/login');

    } catch (err) {
      setMsgError(err.message);
      setCanSubmit(true);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="account">
        <div className="form-signin">
          <Logo />

          <h4 className="text-center mb-4 text-muted">Novo Administrador</h4>

          <form className="signin" onSubmit={handleSignupSubmit}>
            
            <div className="mb-3">
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="E-mail"
                name="userEmail"
                required
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
                minLength="6"
                value={formData.userPwd}
                onChange={handleChange}
              />
            </div>

            <div className="invalid-msg text-center mb-2">
              <span> {msgError} </span>
            </div>

            <button className="btn btn-lg btn-primary w-100 mt-4" type="submit" disabled={!canSubmit}>
              Criar Conta
            </button>
          </form>

          <div className="singup d-flex justify-content-center mt-4">
            <div className="signup">
              <Link to="/login" className="text-primary text-decoration-none fw-bold">
                Já tem conta? Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}