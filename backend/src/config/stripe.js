import "dotenv/config";
import Stripe from "stripe";

let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log("✅ Stripe activé");
} else {
  console.log("⚠️ Stripe désactivé (STRIPE_SECRET_KEY manquant)");
}

export { stripe };
