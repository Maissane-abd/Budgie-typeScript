<template>
  <div class="details-table-wrapper">
    <table class="details-table">
      <thead>
        <tr>
          <th>Mois</th>
          <th>Revenus</th>
          <th>Dépenses</th>
          <th>Intérêts</th>
          <th>Solde</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(month, index) in details"
          :key="index"
          :class="{ 'current-month': isCurrentMonth(month.month) }"
        >
          <td>{{ formatMonthLong(month.month) }}</td>
          <td class="positive">
            {{ formatCurrency(month.income) }}
          </td>
          <td class="negative">
            {{ formatCurrency(month.expense) }}
          </td>
          <td :class="month.interest >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(month.interest) }}
          </td>
          <td class="balance-cell">
            {{ formatCurrency(month.balance) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  details: {
    type: Array,
    required: true,
  },
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatMonthLong(date) {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function isCurrentMonth(date) {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
</script>

<style scoped>
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
  .details-table-wrapper {
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

