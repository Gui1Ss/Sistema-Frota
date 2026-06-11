import axios from 'axios';

// URL do seu backend FastAPI. 
// Você pode mudar isso para o IP real se estiver rodando em outra máquina.
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.178:8001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    "apikey": "citrix21"
  },
});

// Tipos básicos para compatibilidade
export interface ApiResponse<T> {
  data: T;
}
