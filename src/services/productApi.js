// src/services/productApi.js

// Usamos localStorage para simular um banco de dados
const MOCK_PRODUCTS = [
  { _id: 'p1', name: 'Burger Clássico', description: 'Pão, carne e queijo', price: 20.50, isAvailable: true },
  { _id: 'p2', name: 'Batata Frita', description: 'Porção de 300g', price: 15.00, isAvailable: true },
  { _id: 'p3', name: 'Refrigerante Lata', description: 'Coca, Guaraná ou Fanta', price: 7.00, isAvailable: false },
];
const STORAGE_KEY = 'my_products';

// Função para inicializar o "banco de dados"
const getDb = () => {
  let db = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!db || db.length === 0) {
    db = MOCK_PRODUCTS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  return db;
};

// Salva o banco de dados
const saveDb = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

// Simula a latência da rede
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// --- Funções da API ---

export const getProducts = async () => {
  await delay(500); // Simula 0.5s de loading
  return getDb();
};

export const createProduct = async (productData) => {
  await delay(300);
  const db = getDb();
  const newProduct = {
    ...productData,
    _id: `p${Date.now()}`, // ID único
  };
  const newDb = [...db, newProduct];
  saveDb(newDb);
  return newProduct;
};

export const updateProduct = async (productId, productData) => {
  await delay(300);
  const db = getDb();
  const newDb = db.map(p => 
    p._id === productId ? { ...p, ...productData } : p
  );
  saveDb(newDb);
  return { ...productData, _id: productId }; // Retorna o produto atualizado
};

export const deleteProduct = async (productId) => {
  await delay(300);
  const db = getDb();
  const newDb = db.filter(p => p._id !== productId);
  saveDb(newDb);
  return { success: true };
};