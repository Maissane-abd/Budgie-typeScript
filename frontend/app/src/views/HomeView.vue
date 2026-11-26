<template>
  <div class="landing-page">
    <a class="skip-link" href="#contenu-accueil">Aller au contenu</a>
    <header class="landing-header">
      <div class="header-inner">
        <RouterLink class="wordmark" to="/" aria-label="Budgie, accueil">Budgie</RouterLink>
        <nav aria-label="Accès à votre compte">
          <RouterLink class="login-link" to="/login">Connexion</RouterLink>
        </nav>
      </div>
    </header>

    <section id="contenu-accueil" class="hero" aria-labelledby="home-title" tabindex="-1">
      <div class="hero-inner page-container">
        <div class="hero-copy">
          <p class="welcome">Bienvenue sur Budgie,<br />votre outil de gestion de budget.</p>
          <h1 id="home-title">
            <span>Anticipez votre budget</span> pour mieux préparer la fin du mois.
          </h1>
          <p class="hero-description">
            Renseignez vos revenus et vos dépenses. Visualisez votre solde à venir pour repérer ce
            que vous pouvez ajuster.
          </p>
          <div class="hero-actions">
            <RouterLink class="button-primary" to="/register">Créer mon compte</RouterLink>
            <a class="text-link" href="#exemple">Voir un exemple</a>
          </div>
          <p class="manual-entry">Saisie manuelle, sans connexion bancaire.</p>
        </div>

        <figure class="forecast-preview" aria-labelledby="preview-label">
          <div class="preview-meta">
            <span class="example-badge">Exemple fictif</span>
            <span>Décembre 2026</span>
          </div>
          <div class="preview-balance">
            <div>
              <p id="preview-label" class="preview-label">Solde prévisionnel</p>
              <p class="preview-date">au 31 décembre</p>
            </div>
            <p class="preview-amount">−50 €</p>
          </div>
          <figcaption>Estimation à partir des opérations renseignées.</figcaption>
        </figure>
      </div>
    </section>

    <div class="page-container reading-sections">
      <section class="reading-section" aria-labelledby="why-title">
        <div class="section-content">
          <h2 id="why-title">Pourquoi utiliser Budgie pour gérer mon budget ?</h2>
          <p>
            Des charges élevées, des revenus variables ou des dépenses qui s’accumulent : plusieurs
            raisons peuvent déséquilibrer un budget.
          </p>
          <p>
            En regroupant vos revenus et vos dépenses, Budgie estime votre solde à la date choisie.
            Vous pouvez ainsi voir ce qui se prépare et réfléchir aux ajustements possibles, selon
            votre situation.
          </p>

          <div id="exemple" class="budget-example" tabindex="-1">
            <div class="example-heading">
              <p class="eyebrow">Données fictives</p>
              <h3>Un ajustement, une autre prévision</h3>
            </div>
            <div class="budget-table-card">
              <table class="budget-table">
                <caption>Budget de décembre 2026</caption>
                <thead>
                  <tr>
                    <th scope="col">Opération</th>
                    <th scope="col">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Solde de départ</th>
                    <td>100 €</td>
                  </tr>
                  <tr>
                    <th scope="row">Salaire</th>
                    <td>1 600 €</td>
                  </tr>
                  <tr>
                    <th scope="row">Aide financière renseignée</th>
                    <td>200 €</td>
                  </tr>
                  <tr>
                    <th scope="row">Dépenses prévues</th>
                    <td>1 950 €</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Solde estimé au 31 décembre</th>
                    <td>−50 €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p class="expense-breakdown">
              Les dépenses comprennent : loyer 750 €, courses 300 €, transport 100 €, énergie
              100 €, crédit 300 €, sorties et achats plaisir 400 €.
            </p>
            <p>
              Dans cet exemple, la personne choisit de ramener ses sorties et achats plaisir de
              400 € à 250 €. Elle modifie cette dépense dans Budgie, puis actualise ses prévisions.
            </p>
            <div class="comparison" role="group" aria-label="Illustration avant et après modification">
              <div class="comparison-card">
                <p class="comparison-label">Avant modification</p>
                <p class="comparison-amount amount-negative">−50 €</p>
              </div>
              <div class="comparison-card comparison-card--after">
                <p class="comparison-label">Après modification</p>
                <p class="comparison-amount amount-positive">100 €</p>
              </div>
            </div>
            <p class="example-note">
              Les prévisions restent des estimations fondées sur les informations saisies.
            </p>
          </div>

          <p class="gentle-reminder">
            Vos envies ont aussi leur place dans votre budget. L’objectif est de voir ce qu’elles
            représentent et de choisir la place que vous souhaitez leur donner.
          </p>
        </div>
      </section>

      <section class="reading-section" aria-labelledby="start-title">
        <div class="section-content">
          <h2 id="start-title">Comment commencer avec Budgie ?</h2>
          <p>Quelques étapes pour construire une première vision de votre budget :</p>
          <ol class="getting-started" role="list">
            <li>
              <div class="step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M3 10h18M7 15h4" />
                </svg>
              </div>
              <div>
                <h3>Renseignez votre compte et son solde de départ.</h3>
                <p>Un compte principal est créé à l’inscription.</p>
              </div>
            </li>
            <li>
              <div class="step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 8h6M9 12h6M9 16h3" />
                </svg>
              </div>
              <div>
                <h3>Ajoutez vos revenus et vos dépenses.</h3>
                <p>
                  Salaire, aides financières, loyer ou abonnements : indiquez les montants, les
                  dates et les éventuelles récurrences.
                </p>
              </div>
            </li>
            <li>
              <div class="step-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <rect x="3" y="5" width="18" height="16" rx="3" />
                  <path d="M7 3v4M17 3v4M3 11h18M8 15h3M8 18h7" />
                </svg>
              </div>
              <div>
                <h3>Choisissez une date et consultez vos prévisions.</h3>
                <p>Après un changement dans vos opérations, actualisez votre estimation.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section class="reading-section origin-section" aria-labelledby="origin-title">
        <div class="section-content">
          <h2 id="origin-title">Pourquoi avoir créé Budgie ?</h2>
          <p>
            Beaucoup de personnes disent ne pas avoir reçu d’éducation financière et se retrouvent
            à découvert avant la fin du mois. J’ai créé Budgie avec l’envie de les aider à mieux
            comprendre leur budget et à voir plus clairement les conséquences de leurs choix.
          </p>
          <p>
            Des lectures comme <cite>La Psychologie de l’argent</cite>,
            <cite>Le Petit Livre pour investir avec bon sens</cite> et
            <cite>L’Homme le plus riche de Babylone</cite> ont nourri ce projet, notamment autour de
            l’épargne et du rapport à l’argent.
          </p>
          <p>
            À terme, j’aimerais compléter Budgie avec des contenus d’éducation financière pour
            rendre ces sujets plus accessibles.
          </p>
          <div class="closing-invitation">
            <p>Commencez par faire le point sur votre budget.</p>
            <RouterLink class="button-primary" to="/register">Créer mon compte</RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.landing-page {
  --landing-purple: var(--primary, #6b21a8);
  --landing-purple-hover: var(--primary-hover, #581c87);
  --landing-ink: var(--text-main, #111827);
  --landing-muted: #5b6170;
  --landing-border: #e9e5ee;
  color: var(--landing-ink);
  background: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  line-height: 1.65;
  min-height: 100vh;
  overflow-wrap: break-word;
}

.landing-page *,
.landing-page *::before,
.landing-page *::after {
  box-sizing: border-box;
}

.landing-page :where(h1, h2, h3, p, figure) {
  margin: 0;
}

.landing-page a {
  -webkit-tap-highlight-color: transparent;
}

.landing-page a:focus-visible,
.budget-example:focus-visible,
.hero:focus-visible {
  outline: 3px solid var(--landing-purple);
  outline-offset: 5px;
  border-radius: 4px;
}

.page-container,
.header-inner {
  width: min(100% - 3rem, 75rem);
  margin-inline: auto;
}

.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 1rem;
  z-index: 30;
  padding: 0.65rem 1rem;
  background: #ffffff;
  color: var(--landing-purple);
  border: 1px solid var(--landing-purple);
  border-radius: 8px;
  transform: translateY(-200%);
  font-weight: 600;
}

.skip-link:focus {
  transform: translateY(0);
}

.landing-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1px solid var(--landing-border);
}

.header-inner {
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.wordmark {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  color: var(--landing-purple);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  text-decoration: none;
}

.login-link,
.text-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  color: var(--landing-purple);
  font-weight: 600;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
}

.login-link {
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  border-radius: 8px;
}

.login-link:hover {
  background: #f5effb;
}

.hero {
  background: linear-gradient(125deg, #ffffff 20%, #f6f1fc 100%);
  scroll-margin-top: 5rem;
}

.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
  padding-block: 6rem;
}

.welcome {
  color: var(--landing-muted);
  line-height: 1.55;
}

.hero h1 {
  max-width: 13em;
  margin-top: 1.25rem;
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 750;
  line-height: 1.13;
  letter-spacing: -0.045em;
}

.hero h1 span {
  color: var(--landing-purple);
}

.hero-description {
  max-width: 32rem;
  margin-top: 1.5rem;
  color: var(--landing-muted);
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin-top: 1.75rem;
}

.button-primary {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 3.125rem;
  max-width: 100%;
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 999px;
  color: #ffffff;
  background: var(--landing-purple);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
  text-align: center;
  text-decoration: none;
  box-shadow: 0 4px 12px rgb(107 33 168 / 13%);
  transition: background 160ms ease, box-shadow 160ms ease;
}

.button-primary:hover {
  background: var(--landing-purple-hover);
  box-shadow: 0 6px 16px rgb(107 33 168 / 20%);
}

.text-link:hover {
  color: var(--landing-purple-hover);
  text-decoration-thickness: 2px;
}

.manual-entry {
  margin-top: 1rem;
  color: var(--landing-muted);
  font-size: 0.875rem;
}

.forecast-preview {
  padding: 1.75rem;
  border: 1px solid #7840b0;
  border-radius: var(--radius-lg, 16px);
  background: linear-gradient(135deg, #6b21a8 0%, #462084 100%);
  color: #ffffff;
  box-shadow: 0 16px 40px rgb(73 32 118 / 12%);
}

.preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #f1e5ff;
}

.example-badge {
  padding: 0.2rem 0.6rem;
  border: 1px solid #ae82d4;
  border-radius: 999px;
  font-weight: 500;
}

.preview-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-block: 2rem 1.5rem;
}

.preview-label {
  font-size: 1rem;
  font-weight: 500;
}

.preview-date {
  font-size: 0.875rem;
  color: #f1e5ff;
}

.preview-amount {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.05em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.forecast-preview figcaption {
  padding-top: 1rem;
  border-top: 1px solid #9865c4;
  color: #f1e5ff;
  font-size: 0.875rem;
  line-height: 1.5;
}

.reading-sections {
  max-width: 56rem;
}

.reading-section {
  padding-block: 3rem;
  border-bottom: 1px solid var(--landing-border);
}

.section-content {
  min-width: 0;
}

.section-content > p,
.budget-example > p {
  max-width: 75ch;
}

.section-content h2 {
  margin-bottom: 1.5rem;
  font-size: clamp(1.75rem, 2.5vw, 2.125rem);
  font-weight: 700;
  line-height: 1.22;
  letter-spacing: -0.035em;
}

.section-content > p + p {
  margin-top: 1rem;
}

.section-content > p,
.budget-example > p,
.getting-started p {
  color: var(--landing-muted);
}

.budget-example {
  margin-top: 2.5rem;
  scroll-margin-top: 6.5rem;
}

.eyebrow {
  color: var(--landing-purple);
  font-size: 0.875rem;
  font-weight: 650;
}

.example-heading h3 {
  margin-top: 0.35rem;
  margin-bottom: 1.25rem;
  font-size: 1.375rem;
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.budget-table-card {
  overflow: hidden;
  border: 1px solid var(--landing-border);
  border-radius: var(--radius-lg, 16px);
  background: #ffffff;
  box-shadow: 0 3px 12px rgb(31 25 44 / 3%);
}

.budget-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
  line-height: 1.45;
}

.budget-table caption {
  padding: 1.125rem 1.25rem;
  background: #f7f4fb;
  color: var(--landing-purple);
  font-weight: 650;
  text-align: left;
}

.budget-table th,
.budget-table td {
  padding: 0.875rem 1.25rem;
  text-align: left;
  border-bottom: 1px solid #f0edf3;
}

.budget-table thead th {
  color: var(--landing-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.budget-table tbody th {
  font-weight: 450;
}

.budget-table td,
.budget-table th:last-child {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.budget-table tfoot th,
.budget-table tfoot td {
  border-bottom: 0;
  background: #f8f5fc;
  font-weight: 650;
}

.budget-table tfoot td {
  color: #b42332;
}

.budget-example > p {
  margin-top: 1.25rem;
}

.expense-breakdown {
  font-size: 1rem;
}

.comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.comparison-card {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--landing-border);
  border-radius: 12px;
  background: #ffffff;
}

.comparison-card--after {
  background: #f6f2fc;
  border-color: #ded0ee;
}

.comparison-label {
  color: var(--landing-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.comparison-amount {
  margin-top: 0.35rem;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.035em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.amount-negative {
  color: #b42332;
}

.amount-positive {
  color: #08734e;
}

.example-note {
  font-size: 0.875rem;
  line-height: 1.6;
}

.gentle-reminder {
  margin-top: 2rem;
  padding-left: 1.25rem;
  border-left: 3px solid #c4a3e0;
}

.getting-started {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  margin: 1.75rem 0 0;
  list-style: none;
}

.getting-started li {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--landing-border);
  border-radius: var(--radius-lg, 16px);
  background: #ffffff;
  box-shadow: 0 3px 12px rgb(31 25 44 / 3%);
}

.step-icon {
  display: flex;
  flex: 0 0 2.5rem;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  background: #f3eafa;
  color: var(--landing-purple);
}

.step-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.getting-started h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.5;
}

.origin-section {
  border-bottom: 0;
  padding-bottom: 4rem;
}

.origin-section cite {
  font-style: italic;
}

.closing-invitation {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--landing-border);
}

.closing-invitation p {
  margin-bottom: 1.25rem;
  font-weight: 600;
}

@media (min-width: 1024px) {
  .getting-started {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .getting-started li {
    flex-direction: column;
  }
}

@media (max-width: 800px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
    padding-block: 2rem 3rem;
  }

  .hero-copy {
    max-width: 36rem;
  }

  .hero h1 {
    max-width: 16em;
    margin-top: 1rem;
    font-size: 2.25rem;
  }

  .forecast-preview {
    width: 100%;
    max-width: 36rem;
  }

  .section-content h2 {
    max-width: 22em;
  }
}

@media (max-width: 480px) {
  .page-container,
  .header-inner {
    width: calc(100% - 2.5rem);
  }

  .header-inner {
    min-height: 4rem;
  }

  .wordmark {
    font-size: 1.5rem;
  }

  .hero {
    scroll-margin-top: 4rem;
  }

  .hero-inner {
    padding-top: 1.5rem;
  }

  .hero h1 {
    margin-top: 0.875rem;
    font-size: 2rem;
    line-height: 1.15;
  }

  .hero-description {
    margin-top: 1rem;
    line-height: 1.6;
  }

  .hero-actions {
    margin-top: 1.25rem;
    column-gap: 1.25rem;
  }

  .button-primary {
    padding-inline: 1.25rem;
  }

  .manual-entry {
    margin-top: 0.75rem;
  }

  .forecast-preview {
    padding: 1.25rem;
  }

  .preview-meta {
    column-gap: 0.5rem;
  }

  .preview-balance {
    margin-block: 1.25rem 1rem;
    gap: 0.5rem;
  }

  .preview-amount {
    font-size: 2.75rem;
  }

  .forecast-preview figcaption {
    padding-top: 0.75rem;
  }

  .budget-table th,
  .budget-table td,
  .budget-table caption {
    padding-inline: 1rem;
  }

  .getting-started li {
    padding: 1rem;
    gap: 0.75rem;
  }

  .budget-example {
    scroll-margin-top: 5rem;
  }
}

@media (max-width: 359px) {
  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }

  .comparison {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .button-primary {
    transition: none;
  }
}
</style>
