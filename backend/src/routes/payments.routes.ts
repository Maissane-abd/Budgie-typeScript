import express from "express";
import { createCheckoutSession, getCurrentSubscription, cancelSubscription, updateSubscription } from "../controllers/payments.controller.ss";
import { requireAuth } from "./auth.js";
import type { Router } from "express";

const router:Router = express.Router();

// Route pour créer une session checkout (nécessite authentification)
router.post("/checkout", requireAuth, createCheckoutSession);

// Route pour récupérer l'abonnement actif de l'utilisateur
router.get("/subscription", requireAuth, getCurrentSubscription);

// Route pour modifier l'abonnement actif (changement de price, ex: mensuel -> annuel)
router.put("/subscription", requireAuth, updateSubscription);

// Route pour annuler l'abonnement actif de l'utilisateur
router.delete("/subscription", requireAuth, cancelSubscription);

// Note: La route webhook est maintenant dans app.js AVANT express.json()

export default router;