<template>
  <div class="header-controls">

    <div class="filters-group">
      <div class="input-wrapper">
        <select
            :value="account"
            @change="$emit('update:account', $event.target.value)"
            class="custom-input"
        >
          <option value="">Tous les comptes</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.account_name }}
          </option>
        </select>
        <svg class="icon-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>

      <div class="input-wrapper">
        <select
            :value="sort"
            @change="$emit('update:sort', $event.target.value)"
            class="custom-input"
        >
          <option value="date_desc">Plus récent</option>
          <option value="date_asc">Plus ancien</option>
          <option value="amount_desc">Plus cher</option>
          <option value="amount_asc">Moins cher</option>
        </select>
        <svg class="icon-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div class="input-wrapper search-wrapper">
      <svg class="icon-search" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
          type="text"
          :value="search"
          @input="$emit('update:search', $event.target.value)"
          placeholder="Rechercher..."
          class="custom-input search-input"
      />
    </div>

  </div>
</template>

<script setup>
defineProps({
  search: String,
  sort: String,
  account: String,
  accounts: Array
});

defineEmits(['update:search', 'update:sort', 'update:account']);
</script>

<style scoped>
.header-controls {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 16px; margin-top: 10px;
}
.filters-group { display: flex; gap: 12px; flex-wrap: wrap; }
.input-wrapper { position: relative; display: flex; align-items: center; }

.custom-input {
  appearance: none; -webkit-appearance: none; background-color: #f9fafb;
  border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 16px; padding-right: 36px;
  font-size: 14px; color: #374151; font-family: inherit; font-weight: 500;
  height: 42px; transition: all 0.2s ease; min-width: 180px; cursor: pointer;
}
.custom-input:focus {
  background-color: #ffffff; border-color: #5409c4;
  box-shadow: 0 0 0 3px rgba(84, 9, 196, 0.1); outline: none;
}

.icon-chevron { position: absolute; right: 12px; width: 16px; height: 16px; color: #9ca3af; pointer-events: none; }
.search-wrapper { flex-grow: 1; max-width: 300px; }
.search-input { width: 100%; padding-left: 40px; padding-right: 16px; cursor: text; }
.icon-search {
  position: absolute; left: 12px; width: 18px; height: 18px; color: #9ca3af;
  pointer-events: none; transition: color 0.2s;
}
.search-input:focus + .icon-search, .search-input:focus ~ .icon-search { color: #5409c4; }

@media (max-width: 640px) {
  .header-controls { flex-direction: column-reverse; align-items: stretch; }
  .filters-group { width: 100%; }
  .input-wrapper, .custom-input, .search-wrapper { width: 100%; max-width: none; }
}
</style>