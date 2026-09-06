<template>
  <div class="account-tabs" v-if="accounts && accounts.length > 0">
    <button
      v-for="account in accounts"
      :key="account.account_id"
      :class="['tab-btn', { active: modelValue === account.account_id }]"
      @click="$emit('update:modelValue', account.account_id)"
    >
      {{ account.account_name }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  accounts: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
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
</style>

