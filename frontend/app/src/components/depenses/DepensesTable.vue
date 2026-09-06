<template>
  <div class="table-wrapper">
    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
      <p>Chargement de vos finances</p>
    </div>

    <div v-else-if="expenses.length === 0" class="state-container empty">
      <p>Aucune dépense pour le moment</p>
    </div>

    <table v-else class="modern-table">
      <thead>
      <tr>
        <th class="col-main">Dépense</th>
        <th>Compte</th>
        <th>Type</th>
        <th>Date</th>
        <th class="col-amount">Montant</th>
        <th class="col-actions"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="expense in expenses" :key="expense.id" class="table-row">

        <td class="col-main">
          <div class="transaction-info">
            <div class="text-group">
              <span class="name">{{ expense.transaction_name }}</span>
              <span v-if="expense.description" class="desc">{{ expense.description }}</span>
            </div>
          </div>
        </td>

        <td class="col-account">
            <span class="account-tag">
              {{ expense.account_name || 'Compte' }}
            </span>
        </td>

        <td>
          <div v-if="expense.duration_type === 'recurring'" class="badge badge-recurring">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
            </svg>
            <span>Récurrent</span>
            <span class="recurrence-detail" v-if="expense.interval_count">
                ({{ expense.interval_count }} {{ translateUnit(expense.interval_unit) }})
              </span>
          </div>
          <div v-else class="badge badge-once">
            Ponctuel
          </div>
        </td>

        <td class="col-date">
          {{ formatDate(expense.start_date) }}
        </td>

        <td class="col-amount">
          -{{ Number(expense.amount).toFixed(2).replace('.', ',') }} €
        </td>

        <td class="col-actions">
          <button class="btn-action btn-edit" @click="$emit('edit', expense)" title="Modifier">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          <button class="btn-action btn-delete" @click="$emit('delete', expense.id)" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  expenses: Array,
  loading: Boolean
});

defineEmits(['delete', 'edit']);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const translateUnit = (unit) => {
  const map = { day: 'j', month: 'mois', year: 'an' };
  return map[unit] || unit;
};
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 16px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

thead th {
  text-align: left;
  padding: 18px 24px;
  color: #9ca3af;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  border-bottom: 1px solid #f3f4f6;
}

.table-row {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background-color: #fafafa;
}

td {
  padding: 20px 24px;
  vertical-align: middle;
  color: #374151;
  font-size: 14px;
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.text-group {
  display: flex;
  flex-direction: column;
}

.name { font-weight: 600; color: #111827; }
.desc { font-size: 12px; color: #9ca3af; margin-top: 2px; }
.account-tag { font-size: 13px; color: #6b7280; font-weight: 500; }

.badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px;
  border-radius: 20px; font-size: 12px; font-weight: 600;
}
.badge-once { background-color: #f3f4f6; color: #4b5563; }
.badge-recurring { background-color: #7C3AED; color: #ffffff; }
.recurrence-detail { font-weight: 400; opacity: 0.8; font-size: 11px; }

.col-date { color: #6b7280; font-feature-settings: "tnum"; }
.col-amount { text-align: right; font-weight: 700; color: #111827; font-feature-settings: "tnum"; white-space: nowrap; }

.col-actions {
  text-align: right;
  min-width: 80px;
  white-space: nowrap;
}

.btn-action {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.btn-delete { color: #9ca3af; }
.btn-delete:hover { background-color: #fee2e2; color: #ef4444; }

.btn-edit { color: #9ca3af; }
.btn-edit:hover { background-color: #e0caff; color: #5409c4; }

.state-container { padding: 60px; text-align: center; color: #9ca3af; }
.spinner {
  border: 3px solid #f3f3f3; border-top: 3px solid #7c3aed;
  border-radius: 50%; width: 24px; height: 24px;
  animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>