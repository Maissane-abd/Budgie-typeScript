// backend/src/routes/webhook.js
// Routes et contrôleurs pour la gestion des webhooks Stripe
import express from 'express';
import { stripe } from '../config/stripe.js';
import bodyParser from 'body-parser';
import type { Request, Response } from 'express';
import type { Router } from 'express';

const router: Router = express.Router();
const endpointSecret: string | undefined = process.env.STRIPE_WEBHOOK_SECRET;

// if (!endpointSecret) {
//   throw new Error(
//     "STRIPE_WEBHOOK_SECRET est manquant dans les variables d'environnement"
//   );
// }


router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req: Request, res: Response<{ received: boolean; } | string>) => {
  const sig: string | string[] | undefined = req.headers['stripe-signature'];
  let event;

  if (!stripe) {
    console.error('Stripe n’est pas configuré correctement.');
    return res.status(400).send('Stripe n’est pas configuré correctement.');
  }

  if (!sig) {
    console.error('Signature Stripe manquante dans les en-têtes.');
    return res.status(400).send('Signature Stripe manquante dans les en-têtes.');
  }

  try {
    if (!endpointSecret) {
    return res.status(503).send(
      "Stripe webhook désactivé (STRIPE_WEBHOOK_SECRET manquant)",
    );
  }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
  if (err instanceof Error) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.error('Erreur inconnue', err);
  return res.status(400).send('Webhook Error: erreur inconnue');
}

  console.log('✅ Event received:', event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      break;

    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
