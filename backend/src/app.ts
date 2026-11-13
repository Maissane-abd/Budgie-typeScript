import 'dotenv/config';
import express from 'express';
import type { Express, Request, Response } from 'express';
import { corsMiddleware, jsonMiddleware } from './middlewares/index.js';

import revenusRoutes from "./routes/revenus.js";
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";
import expensesRoutes from "./routes/expenses.js";
import previsionsRoutes from "./routes/previsions.js";

const app: Express = express();

// Middlewares
app.use(corsMiddleware);
app.use(jsonMiddleware);

// Routes
app.use("/api/revenus", revenusRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/previsions", previsionsRoutes);

// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World from backend!');
});

app.get("/health", (req:Request, res:Response) => {
  res.status(200).send("OK");
});

app.get("/health", (req:Request, res:Response) => {
  res.status(200).send("OK");
});

// Start server
const PORT = process.env.PORT || 5001;
// const PORT = 5001;
app.listen(PORT, (): void => console.log(`Server running on port ${PORT}`));
