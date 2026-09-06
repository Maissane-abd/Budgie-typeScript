<template>
  <div class="accounts-page">

    <div class="card header-card">
      <div class="header-top">
        <div>
          <h1 class="page-title">Mes Comptes</h1>
          <p class="page-subtitle">Gérez vos comptes bancaires et épargne</p>
        </div>

        <button class="btn-primary" @click="openCreateDrawer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Nouveau compte</span>
        </button>
      </div>

      <AccountsFilters
          v-model:search="searchQuery"
          v-model:sort="sortOrder"
          v-model:type="selectedType"
          :types="accountTypes"
      />
    </div>

    <div class="card table-card">
      <AccountsTable
          :accounts="filteredAccounts"
          @edit="openDrawer" 
          @delete="deleteAccount"
      />
    </div>

    <AccountModal
        :show="showDrawer"
        :is-create="isCreate"
        :form="form"
        @update:form="form = $event"
        @close="closeDrawer"
        @save="isCreate ? createAccount() : updateAccount()"
        @delete="deleteAccount"
    />

  </div>
</template>

<script setup>
import {ref, onMounted, computed} from "vue";
import {AccountsService} from "@/services/accounts.service.js";
import {useRouter} from 'vue-router';
import {useToast} from "vue-toastification";


import AccountsFilters from "@/components/accounts/AccountsFilters.vue";
import AccountsTable from "@/components/accounts/AccountsTable.vue";
import AccountModal from "@/components/accounts/AccountModal.vue";

const router = useRouter();
const toast = useToast();

/* ===== STATE ===== */
const accounts = ref([]);
const showDrawer = ref(false);
const form = ref({});
const isCreate = ref(false);

/* ===== FILTRES ===== */
const searchQuery = ref("");
const sortOrder = ref("");
const selectedType = ref("");

/* ===== API ===== */
const loadAccounts = async () => {
  try {
    const token = localStorage.getItem('budgie_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const res = await AccountsService.getAll();
    accounts.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (error) {
    toast.error("Erreur chargement comptes:", error);
  }
};

/* ===== DRAWER ACTIONS ===== */
const openDrawer = (acc) => {
  isCreate.value = false;
  form.value = {...acc};
  showDrawer.value = true;
};

const openCreateDrawer = () => {
  isCreate.value = true;
  form.value = {
    account_name: "",
    description: "",
    balance: 0,
    annual_interest_rate: 0,
    tax_rate: 0,
    created_on: new Date().toISOString(),
  };
  showDrawer.value = true;
};

const closeDrawer = () => {
  showDrawer.value = false;
};

/* ===== CRUD ===== */
/* Accounts.vue */

const createAccount = async () => {
  try {
    await AccountsService.create({
      ...form.value,
      balance: Number(form.value.balance),
      annual_interest_rate: Number(form.value.annual_interest_rate),
      tax_rate: Number(form.value.tax_rate),
    });
    closeDrawer();
    loadAccounts();
  } catch (error) {
    if (error.response) {
      if (error.response.status === 403 && error.response.data.limitReached) {
        toast.error(error.response.data.error);
      }
      else if (error.response.status === 400) {
        toast.error("Veuillez vérifier les champs du formulaire.");
      }
      else {
        toast.error("Une erreur est survenue : " + (error.response.data.error || "Inconnue"));
      }
    } else {
      console.error(error);
      toast.error("Erreur de connexion au serveur.");
    }
  }
};

const updateAccount = async () => {
  try {
    await AccountsService.update(form.value.id, {
      ...form.value,
      annual_interest_rate: Number(form.value.annual_interest_rate),
      tax_rate: Number(form.value.tax_rate),
    });
    closeDrawer();
    loadAccounts();
  } catch (e) {
    toast.error("Erreur modification");
  }
};

const deleteAccount = async (id) => {
  const accountId = id || form.value.id;
  if (!confirm("Voulez-vous vraiment supprimer ce compte ?")) return;
  try {
    await AccountsService.delete(accountId);
    if (showDrawer.value) closeDrawer();
    loadAccounts();
  } catch (e) {
    toast.error("Erreur suppression");
  }
};

/* ===== COMPUTED ===== */
const accountTypes = computed(() => {
  if (!accounts.value) return [];
  return [...new Set(accounts.value.map(a => a.description).filter(Boolean))];
});

const filteredAccounts = computed(() => {
  let list = [...accounts.value];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(a => a.account_name.toLowerCase().includes(q));
  }
  if (selectedType.value) {
    list = list.filter(a => a.description === selectedType.value);
  }
  if (sortOrder.value === "asc") list.sort((a, b) => Number(a.balance) - Number(b.balance));
  if (sortOrder.value === "desc") list.sort((a, b) => Number(b.balance) - Number(a.balance));

  return list;
});

onMounted(loadAccounts);
</script>

<style scoped>
.accounts-page {
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