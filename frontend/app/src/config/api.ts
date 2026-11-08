// src/config/api.ts
console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE);

export const API_BASE: string = import.meta.env.VITE_API_BASE || '/api';
