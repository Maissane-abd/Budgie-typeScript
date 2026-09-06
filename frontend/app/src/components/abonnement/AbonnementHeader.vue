<template>
  <div class="card header-card">
    <div class="header-top">
      <div>
        <h1 class="page-title">Abonnement</h1>
        <p class="page-subtitle">Choisissez le plan qui vous convient</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas de logique nécessaire
</script>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.header-card {
  margin-bottom: 20px;
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
</style>

