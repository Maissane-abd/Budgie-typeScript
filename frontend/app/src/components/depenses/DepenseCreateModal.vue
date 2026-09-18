<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Ajouter une dépense</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nom</label>
          <input v-model="form.transaction_name" type="text" placeholder="Salle de sport"/>
        </div>

        <div class="form-group">
          <label>Montant (€)</label>
          <input v-model.number="form.amount" type="number" placeholder="30,00"/>
        </div>

        <div class="form-group">
          <label>Durée</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="once" v-model="form.duration_type">
              <span>Ponctuelle</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="recurring" v-model="form.duration_type">
              <span>Tous les mois</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Compte</label>
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
          <div class="form-group half" :style="{ opacity: form.duration_type === 'once' ? '0.5' : '1' }">
            <label>Date de fin (facultatif)</label>
            <input
                type="date"
                v-model="form.end_date"
                :disabled="form.duration_type === 'once'"
            />
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
import {reactive, onMounted, ref, watch} from 'vue';
import axios from 'axios';
import {useToast} from "vue-toastification";

const props = defineProps({show: Boolean});
const emit = defineEmits(['close', 'save']);

const toast = useToast();

const accounts = ref([]);
const form = reactive({
  transaction_name: '',
  amount: null,
  duration_type: 'once',
  account_id: null,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  interval_unit: 'month',
  interval_count: 1
});

watch(() => form.duration_type, (newVal) => {
  if (newVal === 'once') {
    form.end_date = '';
  }
});

const fetchAccounts = async () => {
  const token = localStorage.getItem('budgie_token');
  if (!token) return;
  try {
    const res = await axios.get('/api/accounts', {
      headers: {Authorization: `Bearer ${token}`}
    });
    accounts.value = res.data.data;
    if (accounts.value.length > 0) form.account_id = accounts.value[0].id;
  } catch (e) {
    console.error(e);
    toast.error("Impossible de charger les comptes");
  }
};

onMounted(fetchAccounts);

const save = () => {
  if (!form.transaction_name || !form.amount || !form.account_id) {
    toast.error("Veuillez remplir les champs obligatoires");
    return;
  }

  if (form.end_date && form.end_date < form.start_date) {
    toast.error("La date de fin ne peut pas être avant le début !");
    return;
  }
  emit('save', {...form});
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
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0caff;
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
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

input[type="text"], input[type="number"], input[type="date"], select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline-color: #5409c4;
}

.select-gray-wrapper select {
  background-color: #e5e7eb;
  border: none;
  color: #1f2937;
  font-weight: 500;
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
  color: #1f2937;
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
  margin-top: 20px;
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