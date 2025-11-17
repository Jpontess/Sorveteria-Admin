export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    console.log("Enviando login para API:", { email, password });
    setTimeout(() => {
      if (email === "teste@email.com" && password === "123") {
        resolve({
          token: "seu-jwt-token-aqui",
          user: { name: "Usuário Teste", email: "teste@email.com" }
        });
      } else {
        reject(new Error("E-mail ou senha inválidos"));
      }
    }, 1000); // Simula 1 segundo de espera da rede
  });
};

export const signup = (formData) => {
  return new Promise((resolve, reject) => {
    console.log("Enviando cadastro para API:", formData);
    setTimeout(() => {
      if (formData.storeName === "loja-existente") {
        reject(new Error("Esse nome de loja já existe"));
      } else {
        // A API normalmente retornaria os dados do usuário/loja criada
        resolve({
          id: "12345",
          ...formData
        });
      }
    }, 1500);
  });
};