<template>
  <div class="account-prevision">
    <div class="account-header">
      <h2>{{ account.account_name }}</h2>
      <div class="account-balance">
        <span class="balance-label">Solde prévisionnel :</span>
        <span class="balance-value">
          {{ formatCurrency(account.forecasted_balance) }}
        </span>
      </div>
    </div>

    <PrevisionsChart
      :monthly-details="account.monthly_details"
      :max-value="maxMonthlyValue"
    />

    <PrevisionsTable :monthly-details="account.monthly_details" />
  </div>
</template>

<script setup>
import PrevisionsChart from './PrevisionsChart.vue';
import PrevisionsTable from './PrevisionsTable.vue';

defineProps({
  account: {
    type: Object,
    required: true,
  },
  maxMonthlyValue: {
    type: Number,
    required: true,
  },
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .account-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

