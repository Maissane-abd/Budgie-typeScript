import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();

// Define a type for the database connection configuration
type ConnectionConfig = {
  connectionString: string | undefined;
  ssl:
    | boolean
    | {
        rejectUnauthorized: boolean;
      };
  user: string | undefined;
  host: string | undefined;
  database: string | undefined;
  password: string | undefined;
  port: number | undefined;
  max: number;
  idleTimeoutMillis: number;
};

// Check if the application is running in production mode (e.g., on Render)
const isProduction: boolean = !!process.env.DATABASE_URL;

// Create a new PostgreSQL connection pool with the specified configuration
const connectionConfig: ConnectionConfig = {
  connectionString: process.env.DATABASE_URL,

  ssl: isProduction ? { rejectUnauthorized: false } : false,

  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),

  max: 10,
  idleTimeoutMillis: 30000,
};

const db: Pool = new Pool(connectionConfig);

// Log a message when the database connection is established
db.on('connect', () => {
  console.log(
    isProduction
      ? 'Connecté à PostgreSQL (Mode Production/Render)'
      : 'Connecté à PostgreSQL (Mode Local)',
  );
});

db.on('error', (err) => {
  console.error('Erreur PostgreSQL', err);
});

export default db;
