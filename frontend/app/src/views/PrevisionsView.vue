<template>
  <div class="page-previsions">
    <div class="previsions-container">
      <PrevisionsHeader />

      <PrevisionsControls
        v-model="targetDate"
        :loading="loading"
        @change="fetchPrevisions"
        @refresh="fetchPrevisions"
      />

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="loading && !previsions" class="loading">
        Chargement des prévisions...
      </div>

      <div v-else-if="previsions" class="previsions-content">
        <div class="summary-cards" v-if="selectedAccount">
          <div class="summary-card">
            <div class="summary-label">Solde initial</div>
            <div class="summary-value">
              {{ formatCurrency(selectedAccountStartingBalance) }}
            </div>
          </div>
          <div class="summary-card highlight">
            <div class="summary-label">Solde prévisionnel</div>
            <div class="summary-value">
              {{ formatCurrency(selectedAccountForecastedBalance) }}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Évolution</div>
            <div
              class="summary-value"
              :class="{
                positive: selectedAccountEvolution >= 0,
                negative: selectedAccountEvolution < 0
              }"
            >
              {{ formatCurrency(selectedAccountEvolution) }}
            </div>
          </div>
        </div>

        <div class="account-tabs" v-if="previsions.accounts && previsions.accounts.length > 0">
          <button
            v-for="account in previsions.accounts"
            :key="account.account_id"
            :class="['tab-btn', { active: activeAccountId === account.account_id }]"
            @click="activeAccountId = account.account_id"
          >
            {{ account.account_name }}
          </button>
        </div>

        <div
          v-for="account in previsions.accounts"
          :key="account.account_id"
          v-show="activeAccountId === account.account_id"
          class="account-prevision"
        >
          <div class="account-header">
            <h2>{{ account.account_name }}</h2>
            <div class="account-balance">
              <span class="balance-label">Solde prévisionnel :</span>
              <span class="balance-value">
                {{ formatCurrency(account.forecasted_balance) }}
              </span>
            </div>
          </div>

          <div class="chart-container">
            <div class="chart-bars">
              <div
                v-for="(month, index) in account.monthly_details.slice(0, 12)"
                :key="index"
                class="chart-bar-wrapper"
              >
                <div class="chart-bar-container">
                  <div
                    class="chart-bar positive"
                    :style="{
                      height: `${Math.abs((month.income / maxMonthlyValue) * 100)}%`
                    }"
                    :title="`Revenus: ${formatCurrency(month.income)}`"
                  ></div>
                  <div
                    class="chart-bar negative"
                    :style="{
                      height: `${Math.abs((month.expense / maxMonthlyValue) * 100)}%`
                    }"
                    :title="`Dépenses: ${formatCurrency(month.expense)}`"
                  ></div>
                </div>
                <div class="chart-label">
                  {{ formatMonth(month.month) }}
                </div>
              </div>
            </div>
          </div>

          <PrevisionsTable :details="account.monthly_details" />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
// Imports des composants
import PrevisionsHeader from '@/components/previsions/PrevisionsHeader.vue';
import PrevisionsControls from '@/components/previsions/PrevisionsControls.vue';
import PrevisionsTable from '@/components/previsions/PrevisionsTable.vue';
const router = useRouter();
import {API_BASE} from '@config/api.js'
// const API_BASE = 'https://budgie-api-s1yz.onrender.com/api';

const previsions = ref(null);
const loading = ref(false);
const error = ref('');
const targetDate = ref('');
const activeAccountId = ref(null); // ID du compte actuellement affiché

// Initialiser la date cible à 1 an dans le futur
const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
targetDate.value = oneYearFromNow.toISOString().split('T')[0];

// Computed pour obtenir le compte sélectionné
const selectedAccount = computed(() => {
  if (!previsions.value || !previsions.value.accounts || !activeAccountId.value) {
    return null;
  }
  return previsions.value.accounts.find(acc => acc.account_id === activeAccountId.value);
});

// Computed pour les valeurs du compte sélectionné
const selectedAccountStartingBalance = computed(() => {
  return selectedAccount.value?.starting_balance || 0;
});

const selectedAccountForecastedBalance = computed(() => {
  return selectedAccount.value?.forecasted_balance || 0;
});

const selectedAccountEvolution = computed(() => {
  return selectedAccountForecastedBalance.value - selectedAccountStartingBalance.value;
});

const maxMonthlyValue = computed(() => {
  if (!previsions.value || !selectedAccount.value) return 1;
  let max = 0;
  selectedAccount.value.monthly_details.forEach(month => {
    max = Math.max(max, Math.abs(month.income), Math.abs(month.expense));
  });
  return max || 1;
});

async function fetchPrevisions() {
  loading.value = true;
  error.value = '';

  try {
    const token = localStorage.getItem('budgie_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const res = await axios.get(`${API_BASE}/previsions`, {
      params: {
        target_date: targetDate.value
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    previsions.value = res.data;

    // Si on a des comptes et qu'aucun n'est sélectionné, on prend le premier
    if (previsions.value.accounts && previsions.value.accounts.length > 0) {
      if (!activeAccountId.value || !previsions.value.accounts.find(a => a.account_id === activeAccountId.value)) {
        activeAccountId.value = previsions.value.accounts[0].account_id;
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement des prévisions:', err);
    if (err.response?.status === 401) {
      localStorage.removeItem('budgie_token');
      router.push('/login');
    } else {
      error.value =
        err.response?.data?.error ||
        'Erreur lors du chargement des prévisions. Réessaie plus tard.';
    }
  } finally {
    loading.value = false;
  }
}

// --- FONCTIONS UTILITAIRES (Nécessaires pour le Graphique et le Résumé) ---

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatMonth(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'short' });
}

// Note : formatMonthLong et isCurrentMonth ne sont plus nécessaires ICI
// car ils sont maintenant gérés à l'intérieur de PrevisionsTable.vue,
// mais je les laisse au cas où tu en aurais besoin ailleurs dans ce fichier.

onMounted(() => {
  fetchPrevisions();
});
</script>

<style scoped>
.page-previsions {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.previsions-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.previsions-header {
  margin-bottom: 32px;
}

.previsions-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #4a1d96;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
}

.previsions-controls {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.date-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-picker-wrapper label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.date-input {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: #3f2b96;
  box-shadow: 0 0 0 3px rgba(63, 43, 150, 0.1);
}

.refresh-btn {
  padding: 10px 20px;
  background: #3f2b96;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #2f1f72;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* STYLES DES ONGLETS */
.account-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.tab-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.tab-btn.active {
  background: #3f2b96;
  color: white;
  border-color: #3f2b96;
  box-shadow: 0 4px 6px -1px rgba(63, 43, 150, 0.2);
}

.error-message {
  padding: 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-card.highlight {
  background: linear-gradient(135deg, #3f2b96 0%, #2f1f72 100%);
  color: white;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.summary-card.highlight .summary-label {
  color: rgba(255, 255, 255, 0.8);
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.summary-card.highlight .summary-value {
  color: white;
}

.summary-value.positive {
  color: #059669;
}

.summary-value.negative {
  color: #dc2626;
}

.account-prevision {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.account-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.account-balance {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-label {
  font-size: 14px;
  color: #6b7280;
}

.balance-value {
  font-size: 20px;
  font-weight: 700;
  color: #3f2b96;
}

.chart-container {
  margin-bottom: 32px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.chart-bars {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 16px 0;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  position: relative;
}

.chart-bar {
  width: 50%;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  transition: opacity 0.2s;
}

.chart-bar.positive {
  background: #10b981;
}

.chart-bar.negative {
  background: #ef4444;
}

.chart-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
}

/* Note: Les styles .details-table... sont maintenant redondants ici
   car le tableau est dans le composant enfant, mais je les laisse
   pour ne pas casser le style si jamais tu décides de revenir en arrière. */

.details-table-wrapper {
  overflow-x: auto;
}

.details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.details-table thead {
  background: #f9fafb;
}

.details-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.details-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.details-table tbody tr:hover {
  background: #f9fafb;
}

.details-table tbody tr.current-month {
  background: #eff6ff;
  font-weight: 600;
}

.details-table .positive {
  color: #059669;
}

.details-table .negative {
  color: #dc2626;
}

.details-table .balance-cell {
  font-weight: 600;
  color: #111827;
}

@media (max-width: 768px) {
  .previsions-container {
    padding: 16px;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .account-header {
    flex-direction: column;
    align-items: flex-start;
  }

  /* --- MODIFICATION ICI : On cache le graphique sur mobile --- */
  .chart-container, .details-table-wrapper {
    display: none;
  }

  .details-table {
    font-size: 12px;
  }

  .details-table th,
  .details-table td {
    padding: 8px;
  }
}
</style>