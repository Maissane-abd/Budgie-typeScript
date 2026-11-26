<template>
  <div class="legal-page">
    <a class="legal-skip" href="#texte-juridique">Aller au contenu</a>
    <header class="legal-header">
      <RouterLink class="legal-brand" to="/" aria-label="Budgie, accueil">Budgie</RouterLink>
      <RouterLink to="/">Retour à l’accueil</RouterLink>
    </header>

    <article id="texte-juridique" class="legal-content" tabindex="-1" aria-labelledby="legal-title">
      <p class="legal-eyebrow">Informations sur le service</p>
      <h1 id="legal-title">{{ page.title }}</h1>
      <p class="legal-date">
        Mise à jour :
        <time :datetime="legalReview.updatedAt">{{ legalReview.updatedLabel }}</time>
      </p>

      <aside class="legal-review" aria-labelledby="review-title">
        <h2 id="review-title">{{ legalReview.label }}</h2>
        <p>
          Ces textes restent à compléter et à faire relire avant d’être considérés comme définitifs.
        </p>
        <ul>
          <li v-for="pending in legalReview.pending" :key="pending">{{ pending }}</li>
        </ul>
      </aside>

      <nav class="legal-summary" aria-label="Sommaire de cette page">
        <a v-for="section in page.sections" :key="section.id" :href="`#${section.id}`">
          {{ section.title }}
        </a>
        <a href="#contact">Contact</a>
      </nav>

      <section v-for="section in page.sections" :id="section.id" :key="section.id" tabindex="-1">
        <h2>{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        <ul v-if="section.items">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
        <p v-for="link in section.links" :key="link.href">
          <RouterLink v-if="link.href.startsWith('/')" :to="link.href">{{ link.label }}</RouterLink>
          <a v-else :href="link.href">{{ link.label }}</a>
        </p>
      </section>

      <section id="contact" class="legal-contact" tabindex="-1" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact</h2>
        <p>
          Support, gestion du compte, signalement ou demande concernant vos données personnelles :
          écrivez à <a :href="`mailto:${legalContact.email}`">{{ legalContact.email }}</a
          >.
        </p>
        <p>
          Précisez l’objet de votre demande et l’adresse e-mail du compte concerné. N’envoyez pas
          votre mot de passe, vos accès bancaires ou le détail de vos finances.
        </p>
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { legalContact, legalReview, type LegalPage } from '@/content/legal';

defineProps<{ page: LegalPage }>();
</script>

<style scoped>
.legal-page {
  background: #ffffff;
  color: #111827;
  font-size: 1rem;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.legal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  max-width: 75rem;
  min-height: 5rem;
  margin: auto;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e9e5ee;
}

.legal-page a {
  color: #6b21a8;
  text-underline-offset: 0.2em;
}

.legal-page a:hover {
  color: #581c87;
  text-decoration-thickness: 2px;
}

.legal-brand {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  text-decoration: none;
}

.legal-content {
  max-width: 52rem;
  margin: auto;
  padding: 3rem 1.5rem 4rem;
}

.legal-eyebrow {
  margin: 0 0 0.5rem;
  color: #6b21a8;
  font-weight: 600;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
  letter-spacing: -0.035em;
}

.legal-date {
  margin: 1rem 0 2rem;
  color: #5b6170;
  font-size: 0.875rem;
}

.legal-review {
  padding: 1.25rem 1.5rem;
  border: 1px solid #d9c3eb;
  border-left: 4px solid #6b21a8;
  border-radius: 0.75rem;
  background: #faf6ff;
}

.legal-review h2 {
  margin: 0;
  font-size: 1.125rem;
}

.legal-review p {
  margin-top: 0.75rem;
}

.legal-review ul {
  margin-bottom: 0;
}

.legal-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
  padding: 1.5rem 0;
  margin-top: 1rem;
  border-bottom: 1px solid #e9e5ee;
}

.legal-summary a {
  padding-block: 0.35rem;
}

section {
  padding-top: 2rem;
  scroll-margin-top: 1rem;
}

section h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

section p {
  margin: 0 0 1rem;
}

ul {
  padding-left: 1.25rem;
}

li + li {
  margin-top: 0.65rem;
}

.legal-contact {
  margin-top: 2rem;
  border-top: 1px solid #e9e5ee;
}

.legal-page :focus-visible {
  outline: 3px solid #6b21a8;
  outline-offset: 4px;
  border-radius: 3px;
}

.legal-skip {
  position: fixed;
  top: 0.75rem;
  left: 1rem;
  z-index: 30;
  padding: 0.65rem 1rem;
  border: 1px solid #6b21a8;
  border-radius: 0.5rem;
  background: #ffffff;
  transform: translateY(-200%);
}

.legal-skip:focus {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .legal-content {
    padding: 2rem 1rem 3rem;
  }

  .legal-header {
    padding-inline: 1rem;
  }

  .legal-review {
    padding: 1rem;
  }
}
</style>
