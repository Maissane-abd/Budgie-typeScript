import dotenv from 'dotenv';
import { Pool } from 'pg';
// Charge les variables d'environnement (.env) pour le local
dotenv.config();
// const { Pool } = pkg;
// Détection : Si DATABASE_URL existe, on est sur Render (Production)
const isProduction = !!process.env.DATABASE_URL;
const connectionConfig = {
    // Render fournit une URL complète (connectionString).
    // Si elle n'existe pas (local), cette propriété sera undefined et ignorée.
    connectionString: process.env.DATABASE_URL,
    // SSL est OBLIGATOIRE pour Render
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    // Configuration de repli pour le local (Docker)
    // Ces valeurs seront utilisées si connectionString est vide
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
    // Options du pool
    max: 10,
    idleTimeoutMillis: 30000
};
const db = new Pool(connectionConfig);
db.on('connect', () => {
    console.log(isProduction ? '✅ Connecté à PostgreSQL (Mode Production/Render)' : '💻 Connecté à PostgreSQL (Mode Local)');
});
db.on('error', (err) => {
    console.error('❌ Erreur PostgreSQL', err);
});
export default db;
