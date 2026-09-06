<template>
  <div class="table-responsive">
    <table class="modern-table">
      <thead>
      <tr>
        <th>Nom du compte</th>
        <th>Type</th>
        <th>Solde Actuel</th>
        <th>Intérêts</th>
        <th>Impôts</th>
        <th>Créé le</th>
        <th class="text-right">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="accounts.length === 0">
        <td colspan="7" class="empty-state">Aucun compte trouvé</td>
      </tr>
      <tr v-for="acc in accounts" :key="acc.id">
        <td>
          <div class="account-name">{{ acc.account_name }}</div>
        </td>
        <td>
          <span class="badge">{{ acc.description || 'Autre' }}</span>
        </td>
        <td class="amount" :class="{ positive: acc.balance >= 0, negative: acc.balance < 0 }">
          {{ Number(acc.balance).toFixed(2) }} €
        </td>
        <td class="text-muted">{{ acc.annual_interest_rate }}%</td>
        <td class="text-muted">{{ acc.tax_rate }}%</td>
        <td class="text-muted">{{ formatDate(acc.created_on) }}</td>
        <td class="text-right actions-cell">
          <button class="icon-btn edit" @click="$emit('edit', acc)" title="Modifier">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-btn delete" @click="$emit('delete', acc.id)" title="Supprimer">
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
defineProps({ accounts: Array });
defineEmits(['edit', 'delete']);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';
</script>

<style scoped>
.table-responsive { width: 100%; overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; min-width: 800px; }

th {
  text-align: left; padding: 16px 24px;
  color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;
  border-bottom: 1px solid #f3f4f6;
}

td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 14px; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover { background-color: #fafafa; }

.account-name { font-weight: 600; color: #111827; }
.badge { background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }

.amount { font-weight: 700; font-family: monospace; font-size: 15px; }
.amount.positive { color: #10b981; }
.amount.negative { color: #ef4444; }

.text-muted { color: #6b7280; }
.text-right { text-align: right; }

.actions-cell { white-space: nowrap; }

.icon-btn {
  border: none; background: none; cursor: pointer; padding: 8px; border-radius: 8px;
  transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
  margin-left: 4px;
}

.icon-btn.edit { color: #9ca3af; }
.icon-btn.edit:hover { background-color: #e0caff; color: #6b21a8; }

.icon-btn.delete { color: #9ca3af; }
.icon-btn.delete:hover { background-color: #fee2e2; color: #ef4444; }

.empty-state { text-align: center; padding: 40px; color: #9ca3af; font-style: italic; }
</style>