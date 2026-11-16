import { expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import axios from 'axios';
import RevenuModale from '../src/components/revenus/RevenuModale.vue';

it('sends the selected account and monthly recurrence when editing a one-off income', async () => {
  localStorage.setItem('budgie_token', 'valid');
  vi.spyOn(axios, 'get').mockResolvedValue({ data: [
    { id: 'a', account_name: 'Courant' }, { id: 'b', account_name: 'Epargne' },
  ] });
  const put = vi.spyOn(axios, 'put').mockResolvedValue({ data: {} });
  const wrapper = mount(RevenuModale, { props: { show: true, revenu: {
    id: 'income', account_id: 'a', transaction_name: 'Prime', amount: 100,
    start_date: '2026-11-01', duration_type: 'once', end_date: null,
  } } });
  await flushPromises();
  await wrapper.find('select').setValue('b');
  await wrapper.find('input[value="recurring"]').setValue();
  await wrapper.find('.btn-submit').trigger('click');
  await flushPromises();
  expect(put).toHaveBeenCalledWith('/api/revenus/income', expect.objectContaining({
    account_id: 'b', duration_type: 'recurring', interval_count: 1, interval_unit: 'month',
  }), expect.anything());
  expect(wrapper.emitted('updated')).toHaveLength(1);
});
