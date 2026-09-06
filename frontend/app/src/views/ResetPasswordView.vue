<!-- src/views/ResetPasswordView.vue --> 
<template>
  <section class="auth-card">
    <h1 class="auth-title">Réinitialiser le mot de passe</h1>
    <p class="auth-subtitle">
      Entre ton email pour recevoir un lien de réinitialisation.
    </p>

    <form class="auth-form" @submit.prevent="handleReset">
      <div>
        <div class="auth-label">Email</div>
        <input
          v-model="email"
          type="email"
          class="auth-input"
          placeholder="exemple@mail.com"
          required
        />
      </div>

      <p v-if="message" class="auth-success">{{ message }}</p>

      <button class="auth-button" type="submit">
        Envoyer le lien
      </button>
    </form>

    <div class="auth-footer">
      Déjà inscrit ?
      <RouterLink class="auth-link" to="/login">Se connecter</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";

const email = ref("");
const message = ref("");

function handleReset() {
  message.value =
    "Si un compte existe avec cet email, un lien sera envoyé (simulation).";
}
</script>

<style scoped>

.auth-card {
  width: 420px;
  max-width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 32px 32px 28px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
}

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


.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
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
  transition: border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    background var(--transition-fast);
}

.auth-input:focus {
  border-color: var(--primary);
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(63, 43, 150, 0.15);
}

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
  transition: background var(--transition-fast),
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

.auth-footer {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
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
</style>