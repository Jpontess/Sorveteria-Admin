const API_URL = 'https://sorveteria-backend-h7bw.onrender.com/api/relatorio';

// Helper: Converte "2025-01" (Input) -> "Janeiro-2025" (Backend)
export const formatMonthKey = (isoMonth) => {
  if (!isoMonth) return "";
  
  const [year, month] = isoMonth.split('-'); // Separa ano e mês
  
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // O input retorna mês "01" a "12". O array é índice 0 a 11.
  const monthName = months[parseInt(month) - 1];
  
  return `${monthName}-${year}`;
};

export const getMonthlyReport = async (isoMonth) => {
  try {
    // Formata a chave antes de enviar
    const formattedKey = formatMonthKey(isoMonth);
    
    // Faz a requisição: GET /api/relatorio?key=Janeiro-2025
    const response = await fetch(`${API_URL}?key=${formattedKey}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar relatório');
    }

    // Retorna os dados estruturados.
    // Se o backend retornar arrays/stats vazios, o front não quebra.
    return {
      orders: Array.isArray(data.orders) ? data.orders : [],
      stats: {
        totalRevenue: data.stats?.totalRevenue || 0,
        count: data.stats?.count || 0,
        // Se o ticket médio não vier calculado, calculamos aqui
        ticketMedio: data.stats?.ticketMedio || 
          (data.stats?.count > 0 ? (data.stats.totalRevenue / data.stats.count) : 0)
      }
    };

  } catch (error) {
    console.error("Erro ao carregar relatório:", error);
    // Retorno de segurança para a tela não travar
    return {
      orders: [],
      stats: { totalRevenue: 0, count: 0, ticketMedio: 0 }
    };
  }
};