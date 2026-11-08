import { defineStore } from 'pinia';

export interface User {
  id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  plan_name?: string;
  price?: string | number | null;
  max_accounts?: number;
  sub_status?: string;
}

interface UserState {
  user: User | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,

    fullName: (state) => (state.user ? `${state.user.first_name} ${state.user.last_name}` : ''),

    initials: (state) => {
      if (!state.user || !state.user.first_name) return '??';
      const l = state.user.last_name || '';
      return (state.user.first_name[0] + (l ? l[0] : '')).toUpperCase();
    },
  },

  actions: {
    setUser(userData: User) {
      this.user = userData;
    },

    updateUser(partialData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...partialData };
      }
    },

    clearUser() {
      this.user = null;
      localStorage.removeItem('budgie_token');
    },
  },
});
