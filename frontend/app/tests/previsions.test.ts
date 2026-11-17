import { afterEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import axios from 'axios';
import PrevisionsView from '../src/views/PrevisionsView.vue';
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('limits the date picker and blocks requests beyond 100 years, allowing the exact boundary', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 17, 12));
  localStorage.setItem('budgie_token', 'valid');
  const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: { accounts: [] } });
  const wrapper = mount(PrevisionsView);
  await flushPromises();
  const input = wrapper.find('input[type="date"]');
  expect(input.attributes('max')).toBe('2126-11-17');
  await input.setValue('2126-11-18');
  await wrapper.find('.refresh-btn').trigger('click');
  expect(get).toHaveBeenCalledTimes(1);
  expect(wrapper.find('.error-message').text()).toContain('100 ans');
  await input.setValue('2126-11-17');
  await wrapper.find('.refresh-btn').trigger('click');
  await flushPromises();
  expect(get).toHaveBeenCalledTimes(2);
  expect(wrapper.find('.error-message').exists()).toBe(false);
  wrapper.unmount();
});

it('waits for refresh to apply the selected date and displays the initial balance', async () => {
  localStorage.setItem('budgie_token', 'valid');
  const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: { accounts: [{
    account_id: '1', account_name: 'Courant', starting_balance: 1900,
    forecasted_balance: 2950, monthly_details: [],
  }] } });
  const wrapper = mount(PrevisionsView);
  await flushPromises();
  expect(get).toHaveBeenCalledTimes(1);
  expect(wrapper.find('.summary-card .summary-value').text().replace(/\s/g, '')).toBe('1900,00€');
  await wrapper.find('input[type="date"]').setValue('2028-12-31');
  expect(get).toHaveBeenCalledTimes(1);
  await wrapper.find('.refresh-btn').trigger('click');
  await flushPromises();
  expect(get).toHaveBeenCalledTimes(2);
  expect(get.mock.calls[1]?.[1]?.params).toEqual({ target_date: '2028-12-31' });
});
