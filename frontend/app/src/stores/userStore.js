import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,

    fullName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : '',

    initials: (state) => {
      if (!state.user || !state.user.first_name) return '??';
      const l = state.user.last_name || '';
      return (state.user.first_name[0] + (l ? l[0] : '')).toUpperCase();
    }
  },

  actions: {
    setUser(userData) {
      this.user = userData;
    },

    updateUser(partialData) {
      if (this.user) {
        this.user = { ...this.user, ...partialData };
      }
    },

    clearUser() {
      this.user = null;
      localStorage.removeItem('budgie_token');
    }
  }
})