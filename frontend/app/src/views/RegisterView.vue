<!-- src/views/RegisterView.vue -->
<template>
  <div class="register-page">
    <section class="auth-card">
      <h1 class="auth-title">Inscription</h1>
      <p class="auth-subtitle">Crée ton compte Budgie pour suivre tes comptes et tes prévisions.</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div>
          <label for="register-first-name" class="auth-label">Prénom</label>
          <input
            id="register-first-name"
            v-model="firstName"
            type="text"
            autocomplete="given-name"
            class="auth-input"
            placeholder="Votre prénom"
            required
          />
        </div>
        <div>
          <label for="register-last-name" class="auth-label">Nom</label>
          <input
            id="register-last-name"
            v-model="lastName"
            type="text"
            autocomplete="family-name"
            class="auth-input"
            placeholder="Votre nom"
            required
          />
        </div>

        <div class="auth-field-wide">
          <label for="register-email" class="auth-label">Email</label>
          <input
            id="register-email"
            v-model="email"
            autocomplete="email"
            type="email"
            class="auth-input"
            placeholder="nom@exemple.fr"
            required
          />
        </div>

        <div>
          <label for="register-password" class="auth-label">Mot de passe</label>
          <input
            id="register-password"
            v-model="password"
            autocomplete="new-password"
            type="password"
            class="auth-input"
            placeholder="Saisissez un mot de passe"
            required
          />
        </div>

        <div>
          <label for="register-password-confirm" class="auth-label">Confirmer le mot de passe</label>
          <input
            id="register-password-confirm"
            v-model="passwordConfirm"
            autocomplete="new-password"
            type="password"
            class="auth-input"
            placeholder="Confirmez le mot de passe"
            required
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>
        <p v-if="success" class="auth-success">{{ success }}</p>

        <button class="auth-button" type="submit" :disabled="loading">
          {{ loading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>

      <div class="auth-footer">
        Déjà inscrit ?
        <RouterLink class="auth-link" to="/login">Se connecter</RouterLink>
        <p class="auth-terms">En créant un compte, vous acceptez les CGU.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ApiError } from '@/types/models';
import '../assets/main.css';
import { ref } from 'vue';
import axios from 'axios';
import { RouterLink, useRouter } from 'vue-router';
import { API_BASE } from '@/config/api';

const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

// const API_BASE = "https://budgie-api-s1yz.onrender.com/api";
// const API_BASE = "http://localhost:5001/api"

async function handleRegister() {
  error.value = '';
  success.value = '';

  if (password.value !== passwordConfirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }

  loading.value = true;
  try {
    await axios.post(`${API_BASE}/auth/register`, {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      password: password.value,
    });

    success.value = 'Compte créé avec succès, redirection...';
    // petit délai puis redirection vers login
    setTimeout(() => {
      router.push('/login');
    }, 800);
  } catch (err) {
    console.error(err);
    error.value =
      (axios.isAxiosError<ApiError>(err) ? err.response?.data?.error : undefined) ||
      "Erreur lors de l'inscription. Réessaie plus tard.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 32px 24px;
}

/*AUTH CARD*/

.auth-card {
  width: 640px;
  max-width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 32px 32px 28px;
  margin: auto;
}

/*TEXTS*/

.auth-title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

/*FORM*/

.auth-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-bottom: 18px;
}

.auth-field-wide,
.auth-form > .auth-error,
.auth-form > .auth-success,
.auth-form > .auth-button {
  grid-column: 1 / -1;
}

.auth-form > div {
  min-width: 0;
}

.auth-label {
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 4px;
}

.auth-input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #f9fafb;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    background var(--transition-fast);
}

.auth-input:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(63, 43, 150, 0.15);
}

/*BUTTON*/

.auth-button {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 600;
  background: var(--primary);
  color: white;
  cursor: pointer;
  margin-top: 10px;
  box-shadow: 0 10px 25px rgba(63, 43, 150, 0.35);
  transition:
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.auth-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.auth-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 14px rgba(63, 43, 150, 0.35);
}

/*FOOTER LINKS*/

.auth-footer {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.auth-terms {
  margin: 8px 0 0;
  font-size: 11px;
}

.auth-link {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
  margin-left: 4px;
}

.auth-link:hover {
  text-decoration: underline;
}

/*MESSAGES*/

.auth-error {
  font-size: 12px;
  color: #b91c1c;
  margin-bottom: 4px;
}

.auth-success {
  font-size: 12px;
  color: #15803d;
  margin-bottom: 4px;
}
@media (max-width: 600px) {
  .register-page {
    padding: 24px 16px;
  }

  .auth-card {
    padding: 32px 24px 28px;
  }

  .auth-form {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
