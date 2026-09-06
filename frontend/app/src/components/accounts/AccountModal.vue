<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ isCreate ? "Nouveau Compte" : "Modifier Compte" }}</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nom du compte</label>
          <input
              type="text"
              :value="form.account_name"
              @input="update('account_name', $event.target.value)"
              placeholder="Ex: Compte Courant"
              autofocus
          />
        </div>

        <div class="form-group">
          <label>Type / Description</label>
          <input
              type="text"
              :value="form.description"
              @input="update('description', $event.target.value)"
              placeholder="Ex: Courant, Epargne..."
          />
        </div>

        <div class="form-group" v-if="isCreate">
          <label>Solde Initial (€)</label>
          <input
              type="number"
              :value="form.balance"
              @input="update('balance', $event.target.value)"
              placeholder="0.00"
          />
        </div>

        <div class="row-dates">
          <div class="form-group half">
            <label>Intérêts (%)</label>
            <input
                type="number"
                :value="form.annual_interest_rate"
                @input="update('annual_interest_rate', $event.target.value)"
                placeholder="0"
            />
          </div>
          <div class="form-group half">
            <label>Impôts (%)</label>
            <input
                type="number"
                :value="form.tax_rate"
                @input="update('tax_rate', $event.target.value)"
                placeholder="0"
            />
          </div>
        </div>

        <div class="form-group disabled" v-if="!isCreate">
          <label>Date de création</label>
          <input type="text" :value="formatDate(form.created_on)" disabled />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-submit" @click="$emit('save')">
          {{ isCreate ? 'Créer' : 'Enregistrer' }}
        </button>

        <button v-if="!isCreate" class="btn-delete" @click="$emit('delete')">
          Supprimer
        </button>

        <button v-if="isCreate" class="btn-cancel" @click="$emit('close')">
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ show: Boolean, isCreate: Boolean, form: Object });
const emit = defineEmits(['close', 'save', 'delete', 'update:form']);

const update = (key, val) => emit('update:form', { ...props.form, [key]: val });
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '';
</script>

<style scoped>
/* --- STYLES MODALES STANDARD --- */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(84, 9, 196, 0.2);
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex; justify-content: center; align-items: center;
}

.modal-card {
  background: white;
  width: 420px;
  max-width: 90%;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  border: 1px solid #e0caff;
  animation: popIn 0.3s ease-out;
  display: flex; flex-direction: column;
}

@keyframes popIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
}
.modal-header h2 { color: #4a1d96; font-size: 22px; margin: 0; font-weight: 700; }
.btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
.btn-close:hover { color: #4a1d96; }

.modal-body { margin-bottom: 20px; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px; font-weight: 500; }

/* C'est ici que le sélecteur attendait type="text" */
input[type="text"], input[type="number"], input[type="date"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #5409c4;
  box-shadow: 0 0 0 3px rgba(84, 9, 196, 0.1);
}

.form-group.disabled input {
  background: #f3f4f6; color: #9ca3af; cursor: not-allowed;
}

.row-dates { display: flex; gap: 15px; }
.half { flex: 1; }

.modal-footer { display: flex; gap: 12px; margin-top: 10px; }

.btn-submit {
  flex: 2;
  background: #4a1d96; color: white;
  border: none; padding: 12px; border-radius: 8px;
  font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover { background: #3c167e; }

.btn-delete {
  flex: 1;
  background: #fee2e2; color: #ef4444;
  border: none; padding: 12px; border-radius: 8px;
  font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-delete:hover { background: #fecaca; }

.btn-cancel {
  flex: 1;
  background: #e5e7eb; color: #374151;
  border: none; padding: 12px; border-radius: 8px;
  font-weight: 600; cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #d1d5db; }

/* --- RESPONSIVE MOBILE --- */
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

  .btn-submit, .btn-delete, .btn-cancel {
    width: 100%;
    margin: 0;
  }
}
</style>