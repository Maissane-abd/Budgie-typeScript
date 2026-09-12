import { stripe } from "../config/stripe.ts";
import db from "../models/db.ts";
import type { Request, Response } from "express";

type CheckoutSuccessResponse = {
  url: string | null;
};

type CheckoutErrorResponse = {
  error: string;
  details?: string;
  type?: string;
};

type CheckoutResponse =
  | CheckoutSuccessResponse
  | CheckoutErrorResponse;


/**
 * POST /api/payments/checkout
 * Création d'une session Stripe Checkout
 * Body: { priceId }
 */
export async function createCheckoutSession(req: Request, res: Response<CheckoutResponse>): Promise<void> {
  if (!stripe) {
     res.status(503).json({
      error: "Paiements Stripe désactivés en environnement local",
    });
    return;
  }

  if (!req.user) { 
     res.status(401).json({
      error: "Utilisateur non authentifié",
    });
    return;
  }

  const { priceId } = req.body;
  const userEmail:string = req.user.email; // L'utilisateur est authentifié via requireAuth

  if (!priceId) {
     res.status(400).json({
      error: "priceId est requis",
    });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      success_url: `${process.env.CLIENT_URL || "http://localhost"}/abonnement?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost"}/abonnement`,
    });

    res.json({ url: session.url });
  } catch (error) {

     if (error instanceof Error) {
    res.status(500).json({
      error: "Impossible de créer la session",
      details: error.message,
      type: "type" in error && typeof error.type === "string"
        ? error.type
        : "stripe_error"
    });
    return;
  }

  res.status(500).json({
    error: "Impossible de créer la session",
    details: "Erreur inconnue",
    type: "stripe_error"
  });
  }
}
    

   
/**
 * Helper: Récupère ou crée le plan Premium
 */
async function getOrCreatePremiumPlan() {
  const { rows: existing } = await db.query(
      "SELECT id FROM plans WHERE plan_name = 'Premium' LIMIT 1"
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Créer le plan Premium s'il n'existe pas
  const { rows: created } = await db.query(
      `INSERT INTO plans (plan_name, max_accounts, max_expenses_per_account, max_incomes_per_account, price)
       VALUES ('Premium', NULL, NULL, NULL, 4.99)
         RETURNING id`
  );

  return created[0].id;
}

/**
 * Helper: Récupère l'utilisateur par email
 */
async function getUserByEmail(email: string): Promise<string | null> {
  const { rows } = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Helper: Calcule la date de fin en fonction de la période du prix
 */
function calculateEndDate(startedAt: Date, interval: string, intervalCount: number = 1) {
  const endDate = new Date(startedAt);

  if (interval === 'month') {
    endDate.setMonth(endDate.getMonth() + intervalCount);
  } else if (interval === 'year') {
    endDate.setFullYear(endDate.getFullYear() + intervalCount);
  } else if (interval === 'day') {
    endDate.setDate(endDate.getDate() + intervalCount);
  }

  return endDate;
}

/**
 * Helper: Limite les comptes d'un utilisateur à 2 (garde les 2 plus anciens)
 */
async function limitAccountsToTwo(userId: string) {
  try {
    // Compter le nombre de comptes de l'utilisateur
    const { rows: countRows } = await db.query(
        `SELECT COUNT(*) as count
         FROM accounts
         WHERE user_id = $1`,
        [userId]
    );

    const accountCount = parseInt(countRows[0].count, 10);

    // Si l'utilisateur a 2 comptes ou moins, rien à faire
    if (accountCount <= 2) {
      return;
    }

    // Supprimer tous les comptes sauf les 2 plus anciens (en utilisant une sous-requête)
    const { rowCount } = await db.query(
        `DELETE FROM accounts
         WHERE user_id = $1
           AND id NOT IN (
           SELECT id
           FROM accounts
           WHERE user_id = $1
           ORDER BY created_on ASC, created_at ASC
           LIMIT 2
           )`,
        [userId]
    );

    console.log(`${rowCount} comptes supprimés pour l'utilisateur ${userId} (2 comptes conservés)`);
  } catch (error) {
    console.error(`❌ Erreur lors de la limitation des comptes pour l'utilisateur ${userId}:`, error);
    // Ne pas faire échouer le processus si la limitation échoue
  }
}

/**
 * Helper: Crée ou met à jour un abonnement
 */

type UpsertSubscriptionParams = {
  userId: string;
  planId: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  startedAt: Date;
  endsAt: Date | null;
};

async function upsertSubscription({
                                    userId ,
                                    planId ,
                                    status ,
                                    stripeCustomerId ,
                                    stripeSubscriptionId ,
                                    startedAt ,
                                    endsAt ,
                                  }: UpsertSubscriptionParams): Promise<void> {
  // Vérifier si un abonnement existe déjà
  const { rows: existing } = await db.query(
      "SELECT id FROM subscriptions WHERE stripe_subscription_id = $1",
      [stripeSubscriptionId]
  );

  if (existing.length > 0) {
    // Mettre à jour l'abonnement existant
    await db.query(
        `UPDATE subscriptions
         SET status = $1, started_at = $2, ends_at = $3, stripe_customer_id = $4, plan_id = $5
         WHERE stripe_subscription_id = $6`,
        [status, startedAt, endsAt, stripeCustomerId, planId, stripeSubscriptionId]
    );
    console.log(`✅ Abonnement mis à jour: ${stripeSubscriptionId}`);
  } else {
    // Créer un nouvel abonnement
    await db.query(
        `INSERT INTO subscriptions (user_id, plan_id, status, started_at, ends_at, stripe_customer_id, stripe_subscription_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          planId,
          status,
          startedAt,
          endsAt,
          stripeCustomerId,
          stripeSubscriptionId,
        ]
    );
    console.log(`✅ Abonnement créé: ${stripeSubscriptionId}`);
  }
}

/**
 * POST /api/payments/webhook
 * Webhook Stripe
 */

// -- Table des Abonnements
// CREATE TABLE subscriptions (
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   plan_id UUID NOT NULL REFERENCES plans(id),
//   status VARCHAR(50) NOT NULL CHECK (status IN ('active','canceled','trial')),
//   started_at TIMESTAMPTZ NOT NULL,
//   ends_at TIMESTAMPTZ,
//   stripe_customer_id VARCHAR(255),
//   stripe_subscription_id VARCHAR(255),
//   created_at TIMESTAMPTZ DEFAULT now()
// );

type SubscriptionsRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'trial';
  started_at: Date;
  ends_at: Date | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: Date;
};

const endpointSecret: string | undefined = process.env.STRIPE_WEBHOOK_SECRET;

if (!endpointSecret) {
  throw new Error(
      "STRIPE_WEBHOOK_SECRET est manquant dans les variables d'environnement"
  );
}

export const stripeWebhook = async (req:Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({
      error: "Stripe webhook désactivé (Stripe non configuré)",
    });
  }

  const sig: string | string[] | undefined = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
    );
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.error("❌ Webhook signature verification failed: unknown error");
    return res.status(400).send("Webhook Error: unknown error");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Checkout session completed:", session.id);

        if (session.mode === "subscription" && session.subscription) {
          const customerEmail =
            session.customer_email ||
            session.customer_details?.email;

          if (!customerEmail) {
            console.error("❌ Pas d'email dans la session");
            break;
          }

          const userId = await getUserByEmail(customerEmail);

          if (!userId) {
            console.error(
              `❌ Utilisateur introuvable pour l'email: ${customerEmail}`
            );
            break;
          }

          const planId = await getOrCreatePremiumPlan();

          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          const status = subscription.status === "active" ? "active" : "trial";

          // Récupérer l'interval du prix pour le calcul de fallback
          const priceItem = subscription.items?.data?.[0];
          const interval = priceItem?.price?.recurring?.interval || 'month';
          const intervalCount = priceItem?.price?.recurring?.interval_count || 1;

          // Convertir les timestamps Stripe (en secondes) en dates JavaScript
          // Stripe calcule automatiquement current_period_end selon la période du prix (mensuel ou annuel)
          const startedAt = priceItem?.current_period_start
              ? new Date(priceItem.current_period_start * 1000)
              : new Date();

          // Utiliser current_period_end de Stripe, ou calculer en fallback
          let endsAt = null;
          if (priceItem.current_period_end) {
            endsAt = new Date(priceItem.current_period_end * 1000);
          } else if (startedAt) {
            // Fallback: calculer la date de fin en fonction de l'interval
            endsAt = calculateEndDate(startedAt, interval, intervalCount);
          }

          // Log pour vérifier la période (optionnel, pour debug)
          console.log(`📅 Période d'abonnement: ${intervalCount} ${interval}${intervalCount > 1 ? 's' : ''} | Fin: ${endsAt?.toISOString()}`);

          if (subscription.customer === null) {
            console.error("❌ Pas de customer dans l'abonnement:", subscriptionId);
            break;
          }

          const stripeCustomerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id;

          await upsertSubscription({
            userId,
            planId,
            status,
            stripeCustomerId,
            stripeSubscriptionId: subscription.id,
            startedAt,
            endsAt,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log(
            `✅ Subscription ${event.type === "customer.subscription.created" ? "créée" : "mise à jour"}:`,
            subscription.id
        );

        if (!subscription.customer) {
          console.error("❌ Aucun customer associé");
          break;
        }

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        // Récupérer le customer pour obtenir l'email
        const customer = await stripe.customers.retrieve(customerId);

        if ("deleted" in customer) {
          console.error("❌ Le customer Stripe a été supprimé:", customer.id);
          break;
        }

        const customerEmail =
            typeof customer === "object" && customer.email ? customer.email : null;

        if (!customerEmail) {
          console.error("❌ Pas d'email pour le customer:", subscription.customer);
          break;
        }

        const userId = await getUserByEmail(customerEmail);
        if (!userId) {
          console.error(`❌ Utilisateur introuvable pour l'email: ${customerEmail}`);
          break;
        }

        const planId = await getOrCreatePremiumPlan();
        const status =
            subscription.status === "active" || subscription.status === "trialing"
                ? "active"
                : subscription.status === "canceled" || subscription.status === "unpaid"
                    ? "canceled"
                    : "trial";

        // Récupérer l'interval du prix pour le calcul de fallback
        const priceItem = subscription.items?.data?.[0];
        const interval = priceItem?.price?.recurring?.interval || 'month';
        const intervalCount = priceItem?.price?.recurring?.interval_count || 1;

        // Convertir les timestamps Stripe (en secondes) en dates JavaScript
        // Stripe calcule automatiquement current_period_end selon la période du prix (mensuel ou annuel)
        const startedAt = priceItem?.current_period_start
            ? new Date(priceItem.current_period_start * 1000)
            : new Date();

        // Utiliser current_period_end de Stripe, ou calculer en fallback
        let endsAt = null;
        if (priceItem?.current_period_end) {
          endsAt = new Date(priceItem.current_period_end * 1000);
        } else if (startedAt) {
          // Fallback: calculer la date de fin en fonction de l'interval
          endsAt = calculateEndDate(startedAt, interval, intervalCount);
        }

        // Log pour vérifier la période (optionnel, pour debug)
        console.log(`📅 Période d'abonnement: ${intervalCount} ${interval}${intervalCount > 1 ? 's' : ''} | Fin: ${endsAt?.toISOString()}`);

        const stripeCustomerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id; 

        await upsertSubscription({
          userId,
          planId,
          status,
          stripeCustomerId,
          stripeSubscriptionId: subscription.id,
          startedAt,
          endsAt,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("✅ Subscription supprimée:", subscription.id);

        // Récupérer le user_id avant de mettre à jour le statut
        const { rows: subscriptionRows } = await db.query(
            `SELECT user_id
             FROM subscriptions
             WHERE stripe_subscription_id = $1`,
            [subscription.id]
        );

        await db.query(
            `UPDATE subscriptions
             SET status = 'canceled'
             WHERE stripe_subscription_id = $1`,
            [subscription.id]
        );
        console.log(`✅ Abonnement annulé: ${subscription.id}`);

        // Limiter les comptes à 2 si on a trouvé l'utilisateur
        if (subscriptionRows.length > 0) {
          const userId = subscriptionRows[0].user_id;
          await limitAccountsToTwo(userId);
        }
        break;
      }

      default:
        console.log(`ℹ️ Event non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
   if (error instanceof Error) {
      console.error("❌ Erreur lors du traitement du webhook:", error.message);
      return res.status(500).send(`Webhook Error: ${error.message}`);
    }
    console.error("❌ Erreur inconnue lors du traitement du webhook:", error);
    return res.status(500).send("Webhook Error: erreur inconnue");
  }
};

/**
 * GET /api/payments/subscription
 * Récupère l'abonnement actif de l'utilisateur connecté depuis la base de données
 */
export async function getCurrentSubscription(req: { user: { id: string } }, res: any) {
  try {
    const userId = req.user.id;

    const { rows } = await db.query(
        `SELECT s.*, p.plan_name, p.price
         FROM subscriptions s
                JOIN plans p ON p.id = s.plan_id
         WHERE s.user_id = $1
           AND s.status = 'active'
           AND (s.ends_at IS NULL OR s.ends_at > NOW())
         ORDER BY s.created_at DESC
           LIMIT 1`,
        [userId]
    );

    if (rows.length === 0) {
      return res.json({ subscription: null });
    }

    const subscription = rows[0];

    // Récupérer l'interval depuis Stripe pour savoir si c'est mensuel ou annuel
    if (subscription.stripe_subscription_id && stripe) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
        );
        const priceItem = stripeSubscription.items?.data?.[0];
        if (priceItem?.price?.recurring) {
          subscription.interval = priceItem.price.recurring.interval; // 'month' ou 'year'
          subscription.interval_count = priceItem.price.recurring.interval_count;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'abonnement Stripe:", error);
        // On continue même si on ne peut pas récupérer l'interval
      }
    }

    res.json({ subscription });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'abonnement:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'abonnement",
    });
  }
}

/**
 * PUT /api/payments/subscription
 * Modifie l'abonnement actif (change de price, ex: mensuel -> annuel)
 * Body: { priceId }
 */
export async function updateSubscription(req: { user: { id: string }; body: { priceId: string } }, res: any) {
  if (!stripe) {
    return res.status(503).json({
      error: "Stripe non configuré",
    });
  }

  try {
    const userId = req.user.id;
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({
        error: "priceId est requis",
      });
    }

    // Récupérer l'abonnement actif de l'utilisateur
    const { rows } = await db.query(
        `SELECT stripe_subscription_id
         FROM subscriptions
         WHERE user_id = $1
           AND status = 'active'
           AND (ends_at IS NULL OR ends_at > NOW())
         ORDER BY created_at DESC
           LIMIT 1`,
        [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Aucun abonnement actif trouvé",
      });
    }

    const stripeSubscriptionId = rows[0].stripe_subscription_id;

    if (!stripeSubscriptionId) {
      return res.status(400).json({
        error: "Aucun ID d'abonnement Stripe trouvé",
      });
    }

    // Récupérer l'abonnement pour obtenir l'item actuel
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;

    // Mettre à jour l'abonnement avec le nouveau price
    const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: priceId,
      }],
      proration_behavior: 'create_prorations', // Prorata automatique
    });

    console.log(`✅ Abonnement modifié: ${stripeSubscriptionId} -> nouveau price: ${priceId}`);

    // Le webhook customer.subscription.updated mettra à jour la base de données
    res.json({
      message: "Abonnement modifié avec succès",
      subscription: updatedSubscription,
    });
  } catch (error) {
    // console.error("Erreur lors de la modification de l'abonnement:", error);
    // res.status(500).json({
    //   error: "Erreur lors de la modification de l'abonnement",
    //   details: error.message || "Erreur inconnue",
    // });
    if (error instanceof Error) {
      console.error("Erreur lors de la modification de l'abonnement:", error.message);
      return res.status(500).json({
        error: "Erreur lors de la modification de l'abonnement",
        details: error.message,
      });
    }
    console.error("Erreur inconnue lors de la modification de l'abonnement:", error);
    return res.status(500).json({
      error: "Erreur lors de la modification de l'abonnement",
      details: "Erreur inconnue",
    });
  }
}

/**
 * DELETE /api/payments/subscription
 * Annule l'abonnement actif de l'utilisateur connecté
 */
export async function cancelSubscription(req: { user: { id: string } }, res: any) {
  if (!stripe) {
    return res.status(503).json({
      error: "Stripe non configuré",
    });
  }

  try {
    const userId = req.user.id;

    // Récupérer l'abonnement actif de l'utilisateur
    const { rows } = await db.query(
        `SELECT stripe_subscription_id
         FROM subscriptions
         WHERE user_id = $1
           AND status = 'active'
           AND (ends_at IS NULL OR ends_at > NOW())
         ORDER BY created_at DESC
           LIMIT 1`,
        [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Aucun abonnement actif trouvé",
      });
    }

    const stripeSubscriptionId = rows[0].stripe_subscription_id;

    if (!stripeSubscriptionId) {
      return res.status(400).json({
        error: "Aucun ID d'abonnement Stripe trouvé",
      });
    }

    // Annuler l'abonnement dans Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId);

    // Mettre à jour la base de données (le webhook le fera aussi, mais on le fait ici pour être réactif)
    await db.query(
        `UPDATE subscriptions
         SET status = 'canceled'
         WHERE stripe_subscription_id = $1`,
        [stripeSubscriptionId]
    );

    console.log(`✅ Abonnement annulé: ${stripeSubscriptionId}`);

    // Limiter les comptes à 2 (garder les 2 plus anciens)
    await limitAccountsToTwo(userId);

    res.json({
      message: "Abonnement annulé avec succès",
      subscription: canceledSubscription,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erreur lors de l'annulation de l'abonnement:", error.message);
      return res.status(500).json({
        error: "Erreur lors de l'annulation de l'abonnement",
        details: error.message,
      });
    }
    console.error("Erreur inconnue lors de l'annulation de l'abonnement:", error);
    return res.status(500).json({
      error: "Erreur lors de l'annulation de l'abonnement",
      details: "Erreur inconnue",
    });
  }
}