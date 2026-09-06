<template>
  <div class="previsions-controls">
    <div class="date-picker-wrapper">
      <label for="target-date">Date cible :</label>
      <input
        id="target-date"
        :value="modelValue"
        type="date"
        class="date-input"
        @change="handleChange"
      />
    </div>
    <button
      class="refresh-btn"
      :disabled="loading"
      @click="$emit('refresh')"
    >
      {{ loading ? 'Chargement...' : 'Actualiser' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  loading: Boolean,
});

const emit = defineEmits(['update:modelValue', 'change', 'refresh']);

function handleChange(event) {
  emit('update:modelValue', event.target.value);
  emit('change');
}
</script>

<style scoped>
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
</style>

