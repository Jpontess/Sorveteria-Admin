const API_URL = 'https://sorveteria-backend-h7bw.onrender.com/api/auth'; 

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // O seu backend retorna { status: 'Sucesso', token: '...' } ou { status: 'Falha', message: '...' }
    if (!response.ok || data.status === 'Falha' || data.status === 'falha') {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Salvar o token no navegador para usar depois
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error("Erro no Login:", error.message);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || data.status === 'fail' || data.status === 'falha') {
      throw new Error(data.message || 'Erro ao registrar');
    }

    return data;
  } catch (error) {
    console.error("Erro no Registro:", error);
    throw error;
  }
};

// Função utilitária para fazer logout
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};