<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Ajouter un revenu</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nom</label>
          <input
              v-model="form.transaction_name"
              type="text"
              placeholder="Ex: Salaire"
              autofocus
          />
        </div>

        <div class="form-group">
          <label>Montant (€)</label>
          <input
              v-model.number="form.amount"
              type="number"
              placeholder="0.00"
          />
        </div>

        <div class="form-group">
          <label>Type de revenu</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="once" v-model="form.duration_type">
              <span>Ponctuel</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="recurring" v-model="form.duration_type">
              <span>Récurrent</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Compte de réception</label>
          <div class="select-gray-wrapper">
            <select v-model="form.account_id">
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.account_name }}
              </option>
            </select>
          </div>
        </div>

        <div class="row-dates">
          <div class="form-group half">
            <label>Date de début</label>
            <input type="date" v-model="form.start_date"/>
          </div>

          <div class="form-group half" v-if="form.duration_type === 'recurring'">
            <label>Date de fin (opt.)</label>
            <input type="date" v-model="form.end_date"/>
          </div>
        </div>

        <div class="form-group" v-if="form.duration_type === 'recurring'">
          <label>Répéter tous les...</label>
          <div class="row-dates">
            <input type="number" min="1" v-model.number="form.interval_count" style="width: 80px;"/>
            <select v-model="form.interval_unit" style="flex: 1;">
              <option value="day">Jour(s)</option>
              <option value="month">Mois</option>
              <option value="year">Année(s)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-submit" @click="save">Ajouter</button>
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, onMounted, ref} from 'vue';
import axios from 'axios';
import {useToast} from "vue-toastification";

defineProps({
  show: Boolean
});

const emit = defineEmits(['save', 'close']);
const toast = useToast();

const accounts = ref([]);
const API_URL = "https://budgie-api-s1yz.onrender.com/api";

const form = reactive({
  transaction_name: '',
  amount: null,
  description: '',
  start_date: new Date().toISOString().split('T')[0], // Date du jour par défaut
  account_id: null,
  duration_type: 'once',
  interval_count: 1,
  interval_unit: 'month',
  end_date: ''
});

// Récupérer les comptes pour le select
const fetchAccounts = async () => {
  const token = localStorage.getItem("budgie_token");
  if (!token) return;

  try {
    const res = await axios.get(`${API_URL}/accounts`, {
      headers: {Authorization: `Bearer ${token}`}
    });
    accounts.value = Array.isArray(res.data) ? res.data : (res.data.data || []);

    // Sélectionner le premier compte par défaut s'il n'y en a pas de choisi
    if (accounts.value.length > 0 && !form.account_id) {
      form.account_id = accounts.value[0].id;
    }
  } catch (err) {
    console.error("Erreur récupération comptes :", err);
  }
};

onMounted(() => {
  fetchAccounts();
});

const save = () => {
  if (!form.transaction_name || !form.amount || !form.start_date || !form.account_id) {
    toast.error("Veuillez remplir les champs obligatoires (Nom, Montant, Compte, Date).");
    return;
  }

  // Nettoyage si ponctuel
  if (form.duration_type === 'once') {
    form.end_date = null;
    form.interval_count = null;
    form.interval_unit = null;
  }

  emit('save', {...form});

  // Reset form after save (optionnel, dépend si le parent détruit la modale ou la cache)
  form.transaction_name = '';
  form.amount = null;
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(84, 9, 196, 0.2);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-card {
  background: white;
  width: 420px;
  max-width: 90%;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0caff;
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h2 {
  color: #4a1d96;
  font-size: 22px;
  margin: 0;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #4a1d96;
}

.modal-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

input[type="text"], input[type="number"], input[type="date"], select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  border-color: #5409c4;
  box-shadow: 0 0 0 3px rgba(84, 9, 196, 0.1);
}

.select-gray-wrapper select {
  background-color: #f9fafb;
}

.radio-group {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 5px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  color: #374151;
}

.radio-label input {
  accent-color: #5409c4;
  width: 16px;
  height: 16px;
}

.row-dates {
  display: flex;
  gap: 15px;
}

.half {
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn-submit {
  flex: 1;
  background: #4a1d96;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #3c167e;
}

.btn-cancel {
  flex: 1;
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #d1d5db;
}

@media (max-width: 480px) {
  .modal-card {
    width: 95% !important;
    max-width: none;
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .row-dates {
    flex-direction: column;
    gap: 12px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .btn-submit, .btn-cancel, .btn-delete, .btn-save {
    width: 100%;
    margin: 0;
  }
}
</style>