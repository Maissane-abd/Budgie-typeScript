<template>
  <div class="landing-page">

    <header class="landing-header">
      <div class="logo">Budgie</div>
      <div class="auth-buttons">
        <RouterLink to="/register" class="btn-auth btn-outline">S'inscrire</RouterLink>
        <RouterLink to="/login" class="btn-auth btn-solid">Connexion</RouterLink>
      </div>
    </header>

    <section class="hero">
      <div class="hero-content">
        <h1>Gérez vos finances<br>simplement.</h1>
        <p>Suivez vos comptes, dépenses, revenus et prévisions<br>financières en un seul endroit.</p>
      </div>
    </section>

    <section class="why-section">
      <h2 class="section-title">Pourquoi Budgie ?</h2>
      <p class="section-subtitle">
        Budgie vous aide à mieux comprendre vos finances en toute simplicité. Aucune connexion bancaire nécessaire, aucune donnée partagée, tout est sous votre contrôle.
      </p>

      <div class="cards-grid">
        <div class="feature-card">
          <div class="icon-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5">
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              <path d="M21 5c0 1.66-4 3-9 3s-9-1.34-9-3s4-3 9-3s9 1.34 9 3Z"/>
              <circle cx="18" cy="18" r="4" fill="white" stroke="#8b5cf6" stroke-width="2"/>
              <path d="M18 16v2" stroke="#8b5cf6" stroke-width="2"/>
            </svg>
          </div>
          <h3>Données sécurisées et privées</h3>
          <p>Toutes vos données restent chez vous, sans intermédiaires. Aucune exploitation externe : votre vie financière reste privée.</p>
        </div>

        <div class="feature-card">
          <div class="icon-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M8 12l3 3 4-4 3 3" />
              <path d="M8 16h8" stroke-opacity="0.3"/>
            </svg>
          </div>
          <h3>Gestion simple des dépenses</h3>
          <p>Suivez vos comptes, vos dépenses, vos revenus et vos prévisions en un seul coup d'œil.</p>
        </div>

        <div class="feature-card">
          <div class="icon-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9M3 12a9 9 0 0 1 9-9" />
            </svg>
          </div>
          <h3>Gérez vos abonnements, factures et revenus</h3>
          <p>Maîtrisez vos dépenses ponctuelles et mensuelles.</p>
        </div>
      </div>
    </section>

    <section class="pricing-section">
      <h2 class="section-title">Choisissez le plan qui vous convient</h2>
      <p class="section-subtitle">
        Budgie offre un plan gratuit pour commencer, et un plan Premium pour gérer vos finances sans aucune limite.
      </p>

      <div class="pricing-toggle-wrapper">
        <div class="toggle-bg">
          <button
              class="toggle-btn"
              :class="{ active: billing === 'monthly' }"
              @click="billing = 'monthly'"
          >
            Mensuelle
          </button>
          <button
              class="toggle-btn"
              :class="{ active: billing === 'yearly' }"
              @click="billing = 'yearly'"
          >
            Annuelle
          </button>
        </div>
        <div class="eco-badge">
          ECO -20%
        </div>
      </div>

      <div class="pricing-grid">
        <div class="price-card">
          <h3>Plan Gratuit</h3>
          <p class="card-desc">Parfait pour découvrir Budgie et suivre vos finances personnelles de façon simple.</p>

          <ul class="features-list">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 2 comptes maximum</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 7 dépenses par compte</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 2 revenus par compte</li>
            <li class="disabled"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Comptes illimités</li>
            <li class="disabled"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Dépenses illimitées</li>
            <li class="disabled"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Revenus illimités</li>
            <li class="disabled"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Partage des comptes</li>
            <li class="disabled"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Gestion des exceptions</li>
            <li class="disabled"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Support prioritaire</li>
          </ul>

          <div class="spacer"></div>
          <button class="btn-plan secondary">Essayer Budgie gratuitement</button>
        </div>

        <div class="price-card premium">
          <div class="premium-header">
            <h3>Premium</h3>
            <div class="price-display">
              <span class="amount">{{ displayedPriceAmount }}</span>
              <span class="period">{{ displayedPricePeriod }}</span>
            </div>
          </div>
          <p class="card-desc">Pour une gestion illimitée de vos finances.</p>

          <ul class="features-list">
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Comptes illimités</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Dépenses illimitées</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Revenus illimités</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Prévisions avancées</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Partage des comptes</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Gestion des exceptions</li>
            <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Support prioritaire</li>
          </ul>

          <div class="spacer"></div>
          <button class="btn-plan primary">Passer en Premium</button>
        </div>
      </div>
    </section>

    <section class="features-section">
      <h2 class="section-title">Fonctionnalités principales</h2>

      <div class="features-box-grid">
        <div class="feature-item">
          <div class="icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a1d96" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
          </div>
          <div class="text">
            <h4>Gestion des comptes</h4>
            <p>Créez et gérez facilement vos comptes : courants, livrets, investissements. Solde visible en un coup d'œil.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a1d96" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="text">
            <h4>Suivi des dépenses</h4>
            <p>Ajoutez vos dépenses ponctuelles ou récurrentes, suivez vos abonnements et maîtrisez votre budget.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a1d96" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div class="text">
            <h4>Suivi des revenus</h4>
            <p>Gérez vos revenus réguliers ou exceptionnels et visualisez rapidement vos entrées d'argent.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a1d96" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
          </div>
          <div class="text">
            <h4>Prévisions financières</h4>
            <p>Projetez votre solde dans le futur en tenant compte des dépenses, revenus et intérêts.</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';

// --- LOGIC ---
const billing = ref('monthly');
const monthlyPrice = 4.99;
const yearlyDiscount = 0.20;

const displayedPriceAmount = computed(() => {
  if (billing.value === 'yearly') {
    // Calcul mensuel avec réduction pour affichage marketing "4,99€ / mois" ou équivalent
    // Ici, le code précédent affichait le prix annuel. Si tu veux afficher le prix MENSUEL équivalent :
    // return (monthlyPrice * (1 - yearlyDiscount)).toFixed(2).replace('.', ',') + ' €';

    // Si tu veux afficher le prix total annuel :
    const annualTotal = (monthlyPrice * 12 * (1 - yearlyDiscount)).toFixed(2);
    return annualTotal.replace('.', ',') + ' €';
  }
  return monthlyPrice.toString().replace('.', ',') + ' €';
});

const displayedPricePeriod = computed(() => {
  return billing.value === 'yearly' ? '/ an' : '/ mois';
});

</script>

<style scoped>
.landing-page {
  font-family: 'Inter', sans-serif;
  color: #1f2937;
  background-color: #ffffff;
  min-height: 100vh;
}

.landing-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 5%; background: white;
  position: sticky; top: 0; z-index: 100;
}
.logo { font-size: 22px; font-weight: 800; color: #6b21a8; }
.desktop-nav a { margin: 0 15px; text-decoration: none; color: #4b5563; font-weight: 500; font-size: 14px; transition: color 0.2s; }
.desktop-nav a:hover { color: #6b21a8; }
.auth-buttons { display: flex; gap: 10px; }

.btn-auth {
  padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s;
}
.btn-outline { border: 1px solid #6b21a8; color: #6b21a8; }
.btn-outline:hover { background: #f3e8ff; }
.btn-solid { background: #4a1d96; color: white; border: 1px solid #4a1d96; }
.btn-solid:hover { background: #3b0764; }

.hero {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #c4b5fd 100%);
  color: white; padding: 80px 20px; text-align: center;
}
.hero-content { max-width: 800px; margin: 0 auto; }
.hero h1 { font-size: 48px; font-weight: 700; margin-bottom: 20px; line-height: 1.1; letter-spacing: -0.02em;}
.hero p { font-size: 16px; opacity: 0.9; line-height: 1.5; font-weight: 400; }

.why-section { padding: 80px 20px; text-align: center; background: #ffffff; }
.section-title { color: #1f2937; font-size: 28px; font-weight: 700; margin-bottom: 12px; }
.section-subtitle { color: #6b7280; max-width: 700px; margin: 0 auto 60px auto; line-height: 1.5; font-size: 14px; }

.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1100px; margin: 0 auto;
}
.feature-card {
  background: white; padding: 40px 24px; border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f3f4f6;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  transition: transform 0.2s;
}
.feature-card:hover { transform: translateY(-5px); }
.icon-illustration { margin-bottom: 20px; }
.feature-card h3 { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }
.feature-card p { font-size: 13px; color: #6b7280; line-height: 1.5; }

.pricing-section { padding: 80px 20px; background: #f9fafb; text-align: center; }

.pricing-toggle-wrapper {
  position: relative; display: inline-flex; margin-bottom: 50px; align-items: center;
}
.toggle-bg {
  background: #e5e7eb; border-radius: 50px; padding: 4px; display: flex;
}
.toggle-btn {
  background: transparent; border: none; color: #4b5563;
  padding: 8px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.toggle-btn.active {
  background: #7c3aed; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.eco-badge {
  position: absolute; right: -70px; top: -10px;
  background: #7c3aed; color: white; font-size: 10px; font-weight: 700;
  padding: 4px 8px; border-radius: 12px; transform: rotate(5deg);
}

.pricing-grid {
  display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; max-width: 1000px; margin: 0 auto;
}
.price-card {
  background: white; width: 350px; padding: 40px 32px; border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left;
  display: flex; flex-direction: column;
}
.price-card.premium {
  border: 2px solid #a78bfa; /* Bordure violette */
  box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.1);
}

.price-card h3 { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
.card-desc { font-size: 13px; color: #6b7280; margin-bottom: 24px; line-height: 1.4; min-height: 40px; }

.premium-header { display: flex; justify-content: space-between; align-items: flex-start; }
.price-display { text-align: right; color: #7c3aed; }
.price-display .amount { font-size: 24px; font-weight: 800; display: block; }
.price-display .period { font-size: 12px; font-weight: 500; color: #6b7280; }

.features-list { list-style: none; padding: 0; margin: 0; }
.features-list li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #374151; margin-bottom: 12px; }
.features-list li.disabled { color: #9ca3af; text-decoration: line-through; text-decoration-color: #e5e7eb; }

.spacer { flex: 1; }

.btn-plan {
  width: 100%; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 24px; border: none; transition: all 0.2s;
}
.btn-plan.secondary { background: #c4b5fd; color: #4c1d95; }
.btn-plan.secondary:hover { background: #a78bfa; }
.btn-plan.primary { background: #c4b5fd; color: #4c1d95; }
.btn-plan.primary:hover { background: #a78bfa; }

.features-section { padding: 80px 20px; max-width: 1000px; margin: 0 auto; text-align: center; }
.features-box-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; text-align: left; }
.feature-item { display: flex; gap: 16px; align-items: flex-start; }
.icon-box {
  background: white; width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05); flex-shrink: 0;
}
.feature-item h4 { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; }
.feature-item p { font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0; }

@media (max-width: 768px) {
  .hero h1 { font-size: 32px; }
  .pricing-grid { flex-direction: column; align-items: center; }
  .price-card { width: 100%; max-width: 350px; }
  .features-box-grid { grid-template-columns: 1fr; }
}
</style>