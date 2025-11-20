import io from 'socket.io-client';

// URL do seu backend
const SOCKET_URL = 'https://sorveteria-backend-h7bw.onrender.com';

// Cria a conexão
export const socket = io(SOCKET_URL, {
  transports: ['websocket'], 
  autoConnect: true,
});