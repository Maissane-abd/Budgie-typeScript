import axios from 'axios';

import { API_BASE } from '@/config/api';
import type { Account } from '@/types/models';
export type { Account } from '@/types/models';

const API_URL = `${API_BASE}/accounts`;

export interface AccountPayload {
  account_name: string;
  description: string;
  balance: number;
  annual_interest_rate: number;
  tax_rate: number;
  created_on: string;
}

type AccountId = Account['id'];

export const AccountsService = {
  getAll() {
    const token = localStorage.getItem('budgie_token');

    return axios.get<Account[] | { data: Account[] }>(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  create(payload: AccountPayload) {
    const token = localStorage.getItem('budgie_token');

    return axios.post<Account>(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  update(id: AccountId, payload: Partial<AccountPayload>) {
    const token = localStorage.getItem('budgie_token');

    return axios.put<Account>(`${API_URL}/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  delete(id: AccountId) {
    const token = localStorage.getItem('budgie_token');

    return axios.delete<void>(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
