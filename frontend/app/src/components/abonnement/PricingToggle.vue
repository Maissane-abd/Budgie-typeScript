<template>
  <div class="pricing-toggle-wrapper">
    <div class="toggle-bg">
      <button
        class="toggle-btn"
        :class="{ active: modelValue === 'monthly' }"
        @click="$emit('update:modelValue', 'monthly')"
      >
        Mensuelle
      </button>
      <button
        class="toggle-btn"
        :class="{ active: modelValue === 'yearly' }"
        @click="$emit('update:modelValue', 'yearly')"
      >
        Annuelle
      </button>
    </div>
    <div class="eco-badge">
      ECO -20%
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.pricing-toggle-wrapper {
  position: relative;
  display: inline-flex;
  margin-bottom: 40px;
  align-items: center;
}

.toggle-bg {
  background: #e5e7eb;
  border-radius: 50px;
  padding: 4px;
  display: flex;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #4b5563;
  padding: 8px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #7c3aed;
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.eco-badge {
  position: absolute;
  right: -70px;
  top: -10px;
  background: #7c3aed;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  transform: rotate(5deg);
}

@media (max-width: 768px) {
  .eco-badge {
    display: none;
  }
}
</style>

