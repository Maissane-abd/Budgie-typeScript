<template>
  <div class="abonnement-page">
    <AbonnementHeader />

    <div class="pricing-section">
      <PricingToggle v-model="billing" />

      <div class="pricing-grid">
        <PricingCard
          :plan="freePlan"
          :is-premium="false"
          :displayed-price="'0 €'"
          :price-period="''"
          :has-active-subscription="hasActiveSubscription"
        />

        <PricingCard
          :plan="premiumPlan"
          :is-premium="true"
          :displayed-price="displayedPriceAmount"
          :price-period="displayedPricePeriod"
          :has-active-subscription="hasActiveSubscription"
          :can-change-plan="canChangePlan"
          :loading-checkout="loadingCheckout"
          :loading-update="loadingUpdate"
          :loading-cancel="loadingCancel"
          @subscribe="handleSubscribe"
          @update="handleUpdateSubscription"
          @cancel="handleCancelSubscription"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import AbonnementHeader from '@/components/abonnement/AbonnementHeader.vue';
import PricingToggle from '@/components/abonnement/PricingToggle.vue';
import PricingCard from '@/components/abonnement/PricingCard.vue';

const route = useRoute();

const billing = ref('monthly');
const monthlyPrice = 4.99;
const yearlyDiscount = 0.20;
const loadingCheckout = ref(false);
const loadingCancel = ref(false);
const loadingUpdate = ref(false);
const activeSubscription = ref(null);


const STRIPE_PRICE_IDS = {
  monthly: 'price_1SlaTJBjOH26LR6umeVFohKu', 
  yearly: 'price_1SlaUNBjOH26LR6u1EnEMWk2'  
};

const API_BASE = 'https://budgie-api-s1yz.onrender.com/api';

const displayedPriceAmount = computed(() => {
  if (billing.value === 'yearly') {
    const annualTotal = (monthlyPrice * 12 * (1 - yearlyDiscount)).toFixed(2);
    return annualTotal.replace('.', ',') + ' €';
  }
  return monthlyPrice.toString().replace('.', ',') + ' €';
});

const displayedPricePeriod = computed(() => {
  return billing.value === 'yearly' ? '/ an' : '/ mois';
});

const hasActiveSubscription = computed(() => {
  return activeSubscription.value !== null;
});

// Définir les plans avec leurs features
const freePlan = {
  name: 'Plan Gratuit',
  description: 'Parfait pour découvrir Budgie et suivre vos finances personnelles de façon simple.',
  features: [
    { text: '2 comptes maximum', disabled: false },
    { text: '7 dépenses par compte', disabled: false },
    { text: '2 revenus par compte', disabled: false },
    { text: 'Comptes illimités', disabled: true },
    { text: 'Dépenses illimitées', disabled: true },
    { text: 'Revenus illimités', disabled: true },
    { text: 'Partage des comptes', disabled: true },
    { text: 'Gestion des exceptions', disabled: true },
    { text: 'Support prioritaire', disabled: true },
  ],
};

const premiumPlan = {
  name: 'Premium',
  description: 'Pour une gestion illimitée de vos finances.',
  features: [
    { text: 'Comptes illimités', disabled: false },
    { text: 'Dépenses illimitées', disabled: false },
    { text: 'Revenus illimités', disabled: false },
    { text: 'Prévisions avancées', disabled: false },
    { text: 'Partage des comptes', disabled: false },
    { text: 'Gestion des exceptions', disabled: false },
    { text: 'Support prioritaire', disabled: false },
  ],
};

// Détecter si l'utilisateur peut changer de plan (toggle différent du plan actuel)
const canChangePlan = computed(() => {
  if (!hasActiveSubscription.value || !activeSubscription.value.interval) {
    return false;
  }
  const currentInterval = activeSubscription.value.interval; // 'month' ou 'year'
  const selectedInterval = billing.value === 'yearly' ? 'year' : 'month';
  return currentInterval !== selectedInterval;
});

const fetchCurrentSubscription = async () => {
  const token = localStorage.getItem('budgie_token');
  
  if (!token) {
    return;
  }

  try {
    const response = await axios.get(
      `${API_BASE}/payments/subscription`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    activeSubscription.value = response.data.subscription;
    
    // Initialiser le toggle en fonction de l'abonnement actuel
    if (activeSubscription.value?.interval) {
      billing.value = activeSubscription.value.interval === 'year' ? 'yearly' : 'monthly';
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
  }
};

onMounted(() => {
  fetchCurrentSubscription();
  
  // Si on revient de Stripe avec un session_id, recharger l'abonnement après un délai
  if (route.query.session_id) {
    setTimeout(() => {
      fetchCurrentSubscription();
    }, 2000);
  }
});

const handleSubscribe = async () => {
  const token = localStorage.getItem('budgie_token');
  
  if (!token) {
    alert('Vous devez être connecté pour vous abonner');
    return;
  }

  loadingCheckout.value = true;

  try {
    const priceId = billing.value === 'yearly' ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly;
    
    const response = await axios.post(
      `${API_BASE}/payments/checkout`,
      {
        priceId: priceId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.url) {
      // Rediriger vers Stripe Checkout
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error('Erreur lors de la création de la session checkout:', error);
    alert(error.response?.data?.error || 'Erreur lors de la création de la session de paiement');
    loadingCheckout.value = false;
  }
};

const handleUpdateSubscription = async () => {
  const token = localStorage.getItem('budgie_token');
  
  if (!token) {
    alert('Vous devez être connecté pour modifier votre abonnement');
    return;
  }

  loadingUpdate.value = true;

  try {
    const priceId = billing.value === 'yearly' ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly;
    
    await axios.put(
      `${API_BASE}/payments/subscription`,
      {
        priceId: priceId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Recharger l'abonnement pour mettre à jour l'interface
    await fetchCurrentSubscription();
    alert('Votre abonnement a été modifié avec succès');
  } catch (error) {
    console.error('Erreur lors de la modification de l\'abonnement:', error);
    alert(error.response?.data?.error || 'Erreur lors de la modification de l\'abonnement');
  } finally {
    loadingUpdate.value = false;
  }
};

const handleCancelSubscription = async () => {
  if (!confirm('Êtes-vous sûr de vouloir résilier votre abonnement ?')) {
    return;
  }

  const token = localStorage.getItem('budgie_token');
  
  if (!token) {
    alert('Vous devez être connecté');
    return;
  }

  loadingCancel.value = true;

  try {
    await axios.delete(
      `${API_BASE}/payments/subscription`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Recharger l'abonnement pour mettre à jour l'interface
    await fetchCurrentSubscription();
    alert('Votre abonnement a été résilié avec succès');
  } catch (error) {
    console.error('Erreur lors de la résiliation:', error);
    alert(error.response?.data?.error || 'Erreur lors de la résiliation de l\'abonnement');
  } finally {
    loadingCancel.value = false;
  }
};
</script>

<style scoped>
.abonnement-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pricing-section {
  text-align: center;
  padding: 20px 0;
}

.pricing-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .pricing-grid {
    flex-direction: column;
    align-items: center;
  }
}
</style>

