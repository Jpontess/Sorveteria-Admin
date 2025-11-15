import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('carregando...');
  
  // ==========================================================
  // Usamos EXATAMENTE a mesma URL de API do Render
  // ==========================================================
  const API_URL = "https://sorveteria-backend-h7bw.onrender.com"; 
  // ==========================================================
  
  useEffect(() => {
    // A função é idêntica à do App Cliente
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        
        if (!response.ok) {
          throw new Error(`API fora do ar ou com erro (Status: ${response.status})`);
        }

        const data = await response.json();
        setApiStatus(`✅ ${data.message}`);

      } catch (error) {
        console.error('Erro ao conectar na API:', error);
        setApiStatus(`❌ Erro ao conectar na API: ${error.message}`);
      }
    };

    checkApiHealth();
  }, [API_URL]);

  return (
    <div className="container">
      {/* Mudamos o título para sabermos que é o Admin */}
      <h1>Painel Admin (Hello World)</h1>
      <p>Status da nossa API (Backend):</p>
      
      <div className="status-box">
        {apiStatus}
      </div>
    </div>
  );
}

export default App;