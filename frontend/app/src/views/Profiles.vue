<template>
  <div class="profile-wrapper">

    <div class="hero-banner">
      <div class="hero-content">
        <div class="avatar-container">
          <div class="avatar-circle">{{ userStore.initials }}</div>
        </div>
        <div class="user-headline">
          <h1>{{ user.first_name }} {{ user.last_name }}</h1>
          <p>{{ user.email }}</p>
        </div>
      </div>
    </div>

    <div class="main-content-container">

      <section class="content-section sub-section">
        <AbonnementHeader v-if="user.email" :user="user"/>
      </section>

      <div class="grid-layout">
        <section class="card info-card">
          <div class="card-header">
            <div class="header-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="feather feather-user">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <h2>Mes informations</h2>
            </div>
            <button v-if="!isEditing" class="btn-icon-text" @click="isEditing = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   class="feather feather-edit-2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
              Modifier
            </button>
            <div v-else class="actions">
              <button class="btn-ghost" @click="cancelEdit">Annuler</button>
              <button class="btn-primary" @click="saveProfile">Enregistrer</button>
            </div>
          </div>

          <div class="form-content">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <div class="input-wrapper">
                  <input v-model="form.first_name" type="text" :disabled="!isEditing" placeholder="Votre prénom"/>
                </div>
              </div>
              <div class="form-group">
                <label>Nom</label>
                <div class="input-wrapper">
                  <input v-model="form.last_name" type="text" :disabled="!isEditing" placeholder="Votre nom"/>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper email-wrapper">
                <input v-model="form.email" type="email" :disabled="!isEditing" placeholder="email@exemple.com"/>
                <svg v-if="!isEditing" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="feather feather-lock lock-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section class="danger-zone">
          <div class="danger-content">
            <h3>Supprimer mon compte</h3>
            <p>La suppression du compte est définitive et effacera toutes vos données.</p>
          </div>
          <button class="btn-danger-outline" @click="handleDeleteAccount">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="feather feather-trash-2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </section>
      </div>

    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import axios from 'axios';
import {useRouter} from 'vue-router';
import {useUserStore} from '@/stores/userStore';
import AbonnementHeader from '../components/profile/AbonnementHeader.vue';
import {API_BASE} from '@/config/api.js'

const router = useRouter();
const userStore = useUserStore();

// const API_BASE = "https://budgie-api-s1yz.onrender.com/api";

const user = ref({});
const form = ref({first_name: '', last_name: '', email: ''});
const isEditing = ref(false);

const fetchProfile = async () => {
  if (userStore.user) {
    user.value = userStore.user;
    form.value = {...userStore.user};
  }

  const token = localStorage.getItem("budgie_token");
  if (!token) return router.push('/login');

  try {
    const res = await axios.get(`${API_BASE}/auth/me`, {
      headers: {Authorization: `Bearer ${token}`}
    });
    user.value = res.data;
    form.value = {...res.data};
    userStore.setUser(res.data);
  } catch (err) {
    console.error(err);
  }
};

const saveProfile = async () => {
  const token = localStorage.getItem("budgie_token");
  try {
    const res = await axios.put(`${API_BASE}/auth/me`, form.value, {
      headers: {Authorization: `Bearer ${token}`}
    });
    user.value = {...user.value, ...res.data};
    userStore.updateUser(res.data);
    isEditing.value = false;
  } catch (err) {
    alert("Erreur mise à jour");
  }
};

const cancelEdit = () => {
  form.value = {...user.value};
  isEditing.value = false;
};

const handleDeleteAccount = async () => {
  if (confirm("Action irréversible. Confirmer ?")) {
    const token = localStorage.getItem("budgie_token");
    try {
      await axios.delete(`${API_BASE}/auth/me`, {headers: {Authorization: `Bearer ${token}`}});
      userStore.clearUser();
      router.push('/register');
    } catch (e) {
      alert("Erreur");
    }
  }
};

onMounted(fetchProfile);
</script>

<style scoped>
.profile-wrapper {
  background-color: #f8fafc;
  min-height: 100%;
}

.hero-banner {
  background: linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%);
  padding: 40px 20px 80px 20px;
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  padding: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-bottom: 16px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: white;
  color: #6b21a8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-headline h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.user-headline p {
  margin: 8px 0 0 0;
  font-size: 16px;
  opacity: 0.9;
  font-weight: 500;
}

.main-content-container {
  max-width: 900px;
  margin: -60px auto 40px auto;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

.content-section {
  margin-bottom: 30px;
}

.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b21a8;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.form-content {
  padding: 24px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 15px;
  color: #334155;
  background: #f1f5f9;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  background: white;
  border-color: #6b21a8;
  box-shadow: 0 0 0 3px rgba(107, 33, 168, 0.1);
}

input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.email-wrapper {
  display: flex;
  align-items: center;
}

.lock-icon {
  position: absolute;
  right: 16px;
  color: #94a3b8;
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon-text {
  background: none;
  border: none;
  color: #6b21a8;
  padding: 8px 12px;
}

.btn-icon-text:hover {
  background: #f3e8ff;
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #6b21a8 0%, #4a1d96 100%);
  color: white;
  padding: 10px 20px;
  box-shadow: 0 4px 12px rgba(107, 33, 168, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(107, 33, 168, 0.3);
}

.btn-ghost {
  background: white;
  border: 2px solid #e2e8f0;
  color: #64748b;
  padding: 8px 18px;
}

.btn-ghost:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.danger-zone {
  margin-top: 20px;
  padding: 24px;
  background: #fff0f0;
  border-radius: 16px;
  border: 1px solid #fecaca;
}

.danger-content h3 {
  color: #991b1b;
  margin: 0 0 4px 0;
  font-size: 16px;
}

.danger-content p {
  color: #b91c1c;
  margin: 0 0 16px 0;
  font-size: 13px;
}

.btn-danger-outline {
  width: 100%;
  background: white;
  border: 2px solid #fca5a5;
  color: #dc2626;
  padding: 10px;
  justify-content: center;
}

.btn-danger-outline:hover {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
}

@media (max-width: 900px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }

  .main-content-container {
    margin-top: -40px;
  }

  .hero-banner {
    padding-bottom: 60px;
  }

  .danger-zone {
    margin-top: 0;
  }
}
</style>