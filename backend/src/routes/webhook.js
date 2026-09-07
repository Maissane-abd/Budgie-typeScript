// backend/src/routes/webhook.js
// Routes et contrôleurs pour la gestion des webhooks Stripe
import express from 'express';
import { stripe } from '../config/stripe.js';
import bodyParser from 'body-parser';

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
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
