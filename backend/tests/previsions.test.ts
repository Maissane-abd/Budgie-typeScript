import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../src/models/db.js', () => ({ default: {} }));
vi.mock('../src/routes/auth.js', () => ({ requireAuth: vi.fn() }));
import { calculateAccountForecast } from '../src/routes/previsions';

afterEach(() => vi.useRealTimers());

it('includes past operations in the initial balance without counting them twice', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  const account = {
    id: '1', user_id: '1', account_name: 'Courant', description: null,
    created_on: '2026-01-01', currency: 'EUR', balance: 100,
    annual_interest_rate: 0, tax_rate: 0, created_at: '', updated_at: '',
  };
  const transaction = {
    id: '1', account_id: '1', transaction_name: 'Salaire',
    transaction_type: 'income' as const, description: null, amount: 1000,
    duration_type: 'recurring' as const, start_date: '2026-05-01',
    recurrence_rule: { id: '1', transaction_id: '1', interval_unit: 'month' as const,
      interval_count: 1, start_date: '2026-05-01', end_date: null },
  };
  const result = calculateAccountForecast(account, [transaction, {
    ...transaction, id: '2', transaction_type: 'expense', amount: 200,
    duration_type: null, start_date: '2026-06-10', recurrence_rule: null,
  }, {
    ...transaction, id: '3', amount: 50, duration_type: null,
    start_date: '2026-06-20', recurrence_rule: null,
  }], '2026-07-31');
  expect(result.starting_balance).toBe(1900);
  expect(result.monthly_details.map((month) => month.income)).toEqual([50, 1000]);
  expect(result.monthly_details.map((month) => month.expense)).toEqual([0, 0]);
  expect(result.forecasted_balance).toBe(2950);
});
