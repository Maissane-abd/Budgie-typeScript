<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Modifier le revenu</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nom</label>
          <input
              v-model="form.transaction_name"
              type="text"
              placeholder="Ex: Salaire"
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
              <span>Récurrent (tous les mois)</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Compte de réception</label>
          <div class="select-gray-wrapper">
            <select v-model="form.account_id">
              <option value="" disabled>Sélectionner un compte</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.account_name }}
              </option>
            </select>
          </div>
        </div>

        <div class="row-dates">
          <div class="form-group half">
            <label>Date de réception</label>
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
        <button class="btn-submit" @click="handleUpdate">Enregistrer</button>
        <button class="btn-delete" @click="handleDelete">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, watch, ref, onMounted} from 'vue';
import axios from 'axios';

const props = defineProps({
  show: Boolean,
  revenu: Object // L'objet revenu passé par le parent
});

const emit = defineEmits(['close', 'updated', 'deleted']);

const accounts = ref([]);
const API_URL = "https://budgie-api-s1yz.onrender.com/api";

// Formulaire réactif
const form = reactive({
  id: null,
  transaction_name: '',
  amount: 0,
  duration_type: 'once',
  account_id: null,
  start_date: '',
  end_date: ''
});

// Charger les comptes pour la liste déroulante
const fetchAccounts = async () => {
  const token = localStorage.getItem('budgie_token');
  if (!token) return;
  try {
    const res = await axios.get(`${API_URL}/accounts`, {
      headers: {Authorization: `Bearer ${token}`}
    });
    // Gestion de la structure de réponse { data: [...] } ou [...]
    accounts.value = Array.isArray(res.data) ? res.data : (res.data.data || []);
  } catch (e) {
    console.error("Erreur chargement comptes", e);
  }
};

// Mettre à jour le formulaire quand la prop 'revenu' change
watch(() => props.revenu, (newVal) => {
  if (newVal) {
    form.id = newVal.id;
    form.transaction_name = newVal.transaction_name;
    form.amount = newVal.amount;
    form.duration_type = newVal.duration_type || 'once';
    form.account_id = newVal.account_id;
    // Formatage des dates pour l'input HTML type="date" (YYYY-MM-DD)
    form.start_date = newVal.start_date ? newVal.start_date.split('T')[0] : '';
    form.end_date = newVal.end_date ? newVal.end_date.split('T')[0] : '';
  }
}, {immediate: true});

// Gestion de la date de fin si on repasse en ponctuel
watch(() => form.duration_type, (newVal) => {
  if (newVal === 'once') {
    form.end_date = '';
  }
});

onMounted(fetchAccounts);

// MISE A JOUR
const handleUpdate = async () => {
  if (!form.transaction_name || !form.amount || !form.start_date) {
    alert("Veuillez remplir les champs obligatoires (Nom, Montant, Date).");
    return;
  }

  const token = localStorage.getItem("budgie_token");
  try {
    await axios.put(`${API_URL}/revenus/${form.id}`, form, {
      headers: {Authorization: `Bearer ${token}`}
    });
    emit('updated');
    emit('close');
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la modification");
  }
};

// SUPPRESSION
const handleDelete = async () => {
  if (!confirm("Voulez-vous vraiment supprimer ce revenu ?")) return;

  const token = localStorage.getItem("budgie_token");
  try {
    await axios.delete(`${API_URL}/revenus/${form.id}`, {
      headers: {Authorization: `Bearer ${token}`}
    });
    emit('deleted');
    emit('close');
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la suppression");
  }
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
  flex: 2;
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

.btn-delete {
  flex: 1;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #fecaca;
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