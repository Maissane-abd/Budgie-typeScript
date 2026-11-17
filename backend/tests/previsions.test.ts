import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../src/models/db.js', () => ({ default: {} }));
vi.mock('../src/middlewares/index.js', () => ({ requireAuth: vi.fn() }));
import { calculateAccountForecast, validateTargetDate } from '../src/routes/previsions';

afterEach(() => vi.useRealTimers());

it('accepts the 100-year boundary and rejects the following day and invalid dates', () => {
  const today = new Date(2026, 10, 17, 12);
  expect(validateTargetDate('2126-11-17', today)).toBeNull();
  expect(validateTargetDate('2126-11-18', today)).toContain('100 ans');
  expect(validateTargetDate('9999-12-31', today)).toContain('100 ans');
  expect(validateTargetDate('2126-02-30', today)).toContain('date valide');
  expect(validateTargetDate('invalid', today)).toContain('date valide');
});

it('clamps the 100-year limit to February 28 when the target year is not a leap year', () => {
  const today = new Date(2000, 1, 29, 12);
  expect(validateTargetDate('2100-02-28', today)).toBeNull();
  expect(validateTargetDate('2100-03-01', today)).toContain('100 ans');
});

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

const savings = {
  id: '1', user_id: '1', account_name: 'Savings', description: null,
  created_on: '2025-07-01', currency: 'EUR', balance: 1000,
  annual_interest_rate: 10, tax_rate: 30, created_at: '', updated_at: '',
};

it('credits interest and deducts its tax only on the annual anniversary', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 15, 12));
  const result = calculateAccountForecast(savings, [], '2027-07-01');
  expect(result.starting_balance).toBe(1000);
  expect(result.monthly_details.filter(month => month.interest !== 0)
    .map(month => month.interest)).toEqual([70, 74.9]);
  expect(result.forecasted_balance).toBe(1144.9);
});

it('includes today and past annual interest, excluding future income and expenses', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 6, 1, 12));
  const operations = [
    { id: '1', account_id: '1', transaction_name: 'Today', description: null,
      amount: 100, transaction_type: 'income' as const, duration_type: null,
      start_date: '2026-07-01' },
    { id: '2', account_id: '1', transaction_name: 'Future income', description: null,
      amount: 500, transaction_type: 'income' as const, duration_type: null,
      start_date: '2026-08-01' },
    { id: '3', account_id: '1', transaction_name: 'Future expense', description: null,
      amount: 200, transaction_type: 'expense' as const, duration_type: null,
      start_date: '2026-08-02' },
  ];
  const result = calculateAccountForecast(savings, operations, '2026-08-31');
  expect(result.starting_balance).toBe(1177);
  expect(result.monthly_details[0]?.income).toBe(0);
  expect(result.forecasted_balance).toBe(1477);
  expect(calculateAccountForecast(savings, operations, '2026-08-31')).toEqual(result);
});

it('uses February 28 for a leap-day anniversary in a non-leap year', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2025, 0, 1, 12));
  expect(calculateAccountForecast({ ...savings, created_on: '2024-02-29' }, [],
    '2025-02-27').forecasted_balance).toBe(1000);
  expect(calculateAccountForecast({ ...savings, created_on: '2024-02-29' }, [],
    '2025-02-28').forecasted_balance).toBe(1070);
});
