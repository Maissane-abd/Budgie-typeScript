import { beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import axios from 'axios';
import Revenus from '../src/views/Revenus.vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('vue-toastification', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

beforeEach(() => {
  localStorage.setItem('budgie_token', 'valid');
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
});

async function renderPage() {
  const transactions = [
    { id: 1, account_id: 1, transaction_name: 'Salaire', duration_type: 'recurring', start_date: '2026-06-01', amount: 2000 },
    { id: 2, account_id: 2, transaction_name: 'Prime', duration_type: 'once', start_date: '2026-01-01', amount: 300 },
    { id: 3, account_id: 2, transaction_name: 'Vente', duration_type: 'once', start_date: '2025-12-01', amount: 50 },
  ];
  vi.spyOn(axios, 'get').mockImplementation(async (url) => ({
    data: String(url).endsWith('/accounts')
      ? { data: [{ id: 1, account_name: 'Courant' }, { id: 2, account_name: 'Epargne' }] }
      : transactions,
  }));
  const wrapper = mount(Revenus, {
    global: { stubs: { RevenuCreateModal: true, RevenuModal: true } },
  });
  await flushPromises();
  return wrapper;
}

it('filters by account, period, type and search without breaking the page', async () => {
  try {
    const wrapper = await renderPage();
    const selects = wrapper.findAll('select');
    const rows = () => wrapper.findAll('tbody tr').map((row) => row.text());
    expect(selects[0]!.findAll('option')).toHaveLength(3);
    expect(rows()).toHaveLength(3);

    await selects[0]!.setValue('1');
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain('Salaire');
    await selects[0]!.setValue('');

    await selects[1]!.setValue('month');
    expect(rows()).toHaveLength(1);
    await selects[1]!.setValue('year');
    expect(rows()).toHaveLength(2);
    await selects[1]!.setValue('');

    await selects[2]!.setValue('once');
    expect(rows()).toHaveLength(2);
    await wrapper.find('input[type="text"]').setValue('PRIME');
    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toContain('Prime');

    await selects[0]!.setValue('1');
    expect(rows()).toHaveLength(0);
    expect(wrapper.find('h1').text()).toBe('Revenus');
    await selects[0]!.setValue('');
    await selects[2]!.setValue('');
    await wrapper.find('input[type="text"]').setValue('');
    expect(rows()).toHaveLength(3);
  } finally {
    vi.useRealTimers();
  }
});
