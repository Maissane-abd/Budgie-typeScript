<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-name">Budgie <span>Gestion de budget personnel</span></p>
      <nav aria-label="Informations légales">
        <RouterLink v-for="page in legalPages" :key="page.path" :to="page.path">
          {{ page.title }}
        </RouterLink>
        <a :href="`mailto:${legalContact.email}`">Contact</a>
        <a :href="legalContact.linkedin" rel="noreferrer">LinkedIn</a>
      </nav>
      <p class="footer-credit">développé par {{ legalContact.name }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { legalContact, legalPages } from '@/content/legal';
</script>

<style scoped>
.site-footer {
  padding: 2rem 1.5rem;
  background: #ffffff;
  border-top: 1px solid #e9e5ee;
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.6;
}

.footer-inner {
  max-width: 72rem;
  margin: auto;
}

.footer-name {
  margin: 0 0 0.75rem;
  color: #6b21a8;
  font-size: 1rem;
  font-weight: 700;
}

.footer-name span {
  display: inline-block;
  margin-left: 0.75rem;
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 400;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.5rem;
}

a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  color: #6b21a8;
  text-underline-offset: 0.2em;
}

a:hover {
  color: #581c87;
  text-decoration-thickness: 2px;
}

a:focus-visible {
  outline: 3px solid #6b21a8;
  outline-offset: 4px;
  border-radius: 3px;
}

.footer-credit {
  margin: 0.75rem 0 0;
}

@media (max-width: 480px) {
  .site-footer {
    padding-inline: 1rem;
  }

  .footer-name span {
    display: block;
    margin-left: 0;
  }
}
</style>
