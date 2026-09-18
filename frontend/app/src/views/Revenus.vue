<template>
  <div class="revenus-container">

    <div class="card header-card">
      <div class="header-top">
        <div>
          <h1 class="page-title">Revenus</h1>
          <p class="page-subtitle">Gérez tous vos revenus, mensuels ou ponctuels</p>
        </div>
        <button class="btn-primary" @click="showCreateModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Ajouter un revenu</span>
        </button>
      </div>

      <RevenusFilters @change="updateFilters"/>
    </div>

    <div class="card table-card">
      <RevenusTable
          :revenus="filteredRevenus"
          @select="openEditModal"
      />
    </div>

    <RevenuCreateModal
        :show="showCreateModal"
        @save="handleCreate"
        @close="showCreateModal = false"
    />

    <RevenuModal
        :show="showModal"
        :revenu="selected"
        @close="showModal = false"
        @updated="fetchRevenus"
        @deleted="fetchRevenus"
    />

  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import axios from 'axios';
import {useRouter} from 'vue-router';
import {useToast} from "vue-toastification";

import RevenusTable from '../components/revenus/RevenusTable.vue';
import RevenusFilters from '../components/revenus/RevenusFilters.vue';
import RevenuCreateModal from '../components/revenus/RevenuCreateModal.vue';
import RevenuModal from '../components/revenus/RevenuModale.vue';
import {API_BASE} from '../config/api.js'

const toast = useToast();

const revenus = ref([]);
const showCreateModal = ref(false);
const showModal = ref(false);
const selected = ref({});
const router = useRouter();


const filters = ref({
  account: '',
  period: '',
  type: '',
  search: ''
});

// const API_BASE = "https://budgie-api-s1yz.onrender.com/api";

const fetchRevenus = async () => {
  const token = localStorage.getItem('budgie_token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    const res = await axios.get(`${API_BASE}/revenus`, {
      headers: {Authorization: `Bearer ${token}`}
    });
    revenus.value = res.data;
  } catch (error) {
    console.error("Erreur API :", error);
  }
};

const handleCreate = async (newRevenu) => {
  const token = localStorage.getItem("budgie_token");
  try {
    await axios.post(`${API_BASE}/revenus`, newRevenu, {
      headers: {Authorization: `Bearer ${token}`}
    });
    showCreateModal.value = false;
    fetchRevenus();
    toast.success("Revenu ajouté avec succès !");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Erreur lors de la création du revenu";
    toast.error(errorMessage);
  }
};

const updateFilters = (newFilters) => {
  filters.value = newFilters;
};

const filteredRevenus = computed(() => {
  return revenus.value.filter(r => {
    // Compte
    if (filters.value.account && r.account_id !== filters.value.account) return false;
    // Type
    if (filters.value.type && r.duration_type !== filters.value.type) return false;
    // Recherche
    if (filters.value.search && !r.transaction_name.toLowerCase().includes(filters.value.search.toLowerCase())) return false;

    // Période (Logique simplifiée pour l'exemple)
    if (filters.value.period) {
      const now = new Date();
      const date = new Date(r.start_date);
      if (filters.value.period === 'month' && (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear())) return false;
      if (filters.value.period === 'year' && date.getFullYear() !== now.getFullYear()) return false;
    }

    return true;
  });
});

const openEditModal = (rev) => {
  selected.value = rev;
  showModal.value = true;
};

onMounted(fetchRevenus);
</script>

<style scoped>
.revenus-container {
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

.table-card {
  padding: 0;
  overflow: hidden;
}

@media (max-width: 640px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 24px;
  }

  .filters-bar {
    flex-direction: column;
    width: 100%;
  }
}
</style>