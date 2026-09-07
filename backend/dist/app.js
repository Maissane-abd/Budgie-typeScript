import "dotenv/config";
import express from "express";
import cors from "cors";
import revenusRoutes from "./routes/revenus.js";
import paymentRoutes from "./routes/payments.routes.js";
import webhookRoute from "./routes/webhook.js";
import authRoutes from "./routes/auth.js";
import accountsRoutes from "./routes/accounts.js";
import expensesRoutes from "./routes/expenses.js";
import previsionsRoutes from "./routes/previsions.js";
const app = express();
// Middlewares
app.use(cors());
app.use(express.json());
// Routes
app.use("/api", webhookRoute);
app.use("/api/revenus", revenusRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/previsions", previsionsRoutes);
// Test route
app.get("/", (req, res) => {
    res.send("Hello World from backend!");
});
// Start server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
