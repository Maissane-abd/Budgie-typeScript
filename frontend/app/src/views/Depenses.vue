<template>
  <div class="depenses-container">

    <div class="card header-card">
      <div class="header-top">
        <div>
          <h1 class="page-title">Dépenses</h1>
          <p class="page-subtitle">Suivez et gérez vos dépenses</p>
        </div>
        <button class="btn-primary" @click="showCreateModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Ajouter une dépense</span>
        </button>
      </div>

      <DepensesFilters
          v-model:search="search"
          v-model:sort="filters.sort"
          v-model:account="filters.account"
          :accounts="accounts"
      />
    </div>

    <div class="card table-card">
      <DepensesTable
          :expenses="filteredExpenses"
          :loading="isLoading"
          @delete="deleteExpense"
          @edit="openEditModal"
      />
    </div>

    <DepenseCreateModal
        :show="showCreateModal"
        @close="showCreateModal = false"
        @save="handleCreate"
    />

    <DepenseUpdateModal
        :show="showUpdateModal"
        :expenseToEdit="expenseToEdit"
        @close="showUpdateModal = false"
        @updated="handleUpdate"
    />

  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import axios from 'axios';
import {useToast} from "vue-toastification";
import { API_BASE } from '@/config/api.js';

import DepensesTable from '../components/depenses/DepensesTable.vue';
import DepenseCreateModal from '../components/depenses/DepenseCreateModal.vue';
import DepensesFilters from '../components/depenses/DepensesFilters.vue';
import DepenseUpdateModal from '../components/depenses/DepenseUpdateModal.vue';
import {useRouter} from "vue-router";

const toast = useToast();


const router = useRouter();

const expenses = ref([]);
const accounts = ref([]);
const isLoading = ref(true);

const showCreateModal = ref(false);
const showUpdateModal = ref(false);
const expenseToEdit = ref(null);

const search = ref('');
const filters = ref({
  account: '',
  sort: 'date_desc'
});

// const API_BASE = "https://budgie-api-s1yz.onrender.com/api";


const fetchData = async () => {
  const token = localStorage.getItem('budgie_token');
  if (!token) {
    router.push('/login');
    return;
  }

  isLoading.value = true;
  try {
    const resExp = await axios.get(`${API_BASE}/expenses`, {headers: {Authorization: `Bearer ${token}`}});
    expenses.value = Array.isArray(resExp.data) ? resExp.data : (resExp.data.data || []);

    const resAcc = await axios.get(`${API_BASE}/accounts`, {headers: {Authorization: `Bearer ${token}`}});
    accounts.value = Array.isArray(resAcc.data) ? resAcc.data : (resAcc.data.data || []);
  } catch (err) {
    console.error("Erreur API :", err);
  } finally {
    isLoading.value = false;
  }
};

const handleCreate = async (newExpense) => {
  const token = localStorage.getItem("budgie_token");
  try {
    await axios.post(`${API_BASE}/expenses`, newExpense, {headers: {Authorization: `Bearer ${token}`}});
    showCreateModal.value = false;
    fetchData();
    toast.success("Dépense ajoutée avec succès !");
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Erreur lors de la création de la dépense";
    toast.error(errorMessage);
  }
};

const openEditModal = (expense) => {
  expenseToEdit.value = expense; // On passe la donnée à la modal
  showUpdateModal.value = true;  // On affiche la modal
};

const handleUpdate = async ({id, data}) => {
  const token = localStorage.getItem("budgie_token");
  try {
    await axios.put(`${API_BASE}/expenses/${id}`, data, {
      headers: {Authorization: `Bearer ${token}`}
    });
    showUpdateModal.value = false;
    fetchData();
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la modification");
  }
};

const deleteExpense = async (id) => {
  if (!confirm("Voulez-vous vraiment supprimer cette dépense ?")) return;
  const token = localStorage.getItem("budgie_token");
  try {
    await axios.delete(`${API_BASE}/expenses/${id}`, {headers: {Authorization: `Bearer ${token}`}});
    fetchData();
  } catch (err) {
    console.error(err);
  }
};

const filteredExpenses = computed(() => {
  let result = [...expenses.value];

  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter(e => e.transaction_name.toLowerCase().includes(s));
  }

  if (filters.value.account) {
    result = result.filter(e => e.account_id === filters.value.account);
  }

  switch (filters.value.sort) {
    case 'date_desc':
      result.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      break;
    case 'date_asc':
      result.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      break;
    case 'amount_desc':
      result.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount_asc':
      result.sort((a, b) => a.amount - b.amount);
      break;
  }

  return result;
});

onMounted(fetchData);
</script>

<style scoped>
.depenses-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}

.page-title {
  color: #4a1d96;
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 5px 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.btn-primary {
  background-color: #5409c4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 10px rgba(84, 9, 196, 0.2);
}

.btn-primary:hover {
  background-color: #43079c;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(84, 9, 196, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(84, 9, 196, 0.2);
}

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 640px) {
  /* On change l'alignement de l'en-tête : colonnes au lieu de ligne */
  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  /* Le bouton "Ajouter" prend toute la largeur pour être facile à cliquer */
  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  /* On ajuste légèrement la taille du titre */
  .page-title {
    font-size: 24px;
  }

  /* Si tu as des filtres, on peut aussi les empiler si besoin */
  .filters-bar {
    flex-direction: column;
    width: 100%;
  }
}
</style>