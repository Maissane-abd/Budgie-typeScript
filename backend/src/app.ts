import 'dotenv/config';
import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';

import revenusRoutes from "./routes/revenus.js";
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";
import expensesRoutes from "./routes/expenses.js";
import previsionsRoutes from "./routes/previsions.js";



const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: ['http:localhost:80', 'https://budgie.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);
app.use(express.json());

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
