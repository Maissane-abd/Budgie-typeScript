import { beforeEach, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
vi.mock('../src/models/db.js', () => ({ default: { query: vi.fn() } }));
import db from '../src/models/db.js';
import { update } from '../src/controllers/revenusController.js';

const query = vi.mocked(db.query);
beforeEach(() => query.mockReset());

async function modify(body = {}) {
  const req = { user: { id: 'user' }, params: { id: 'income' }, body: {
    account_id: 'destination', transaction_name: 'Salaire', amount: 100,
    start_date: '2026-11-01', duration_type: 'recurring',
    interval_count: 1, interval_unit: 'month', end_date: '', ...body,
  } } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
  await update(req, res);
  return res;
}

it('changes the account and creates recurrence when converting a one-off income', async () => {
  query.mockResolvedValueOnce({ rowCount: 1 } as never)
    .mockResolvedValueOnce({ rows: [{ id: 'income', account_id: 'destination' }] } as never)
    .mockResolvedValueOnce({ rowCount: 0 } as never)
    .mockResolvedValueOnce({ rowCount: 1 } as never);
  const res = await modify();
  expect(query.mock.calls[0]?.[1]).toEqual(['destination', 'user']);
  expect(query.mock.calls[1]?.[0]).toContain('account_id = COALESCE($8, t.account_id)');
  expect(query.mock.calls[1]?.[1]).toEqual([
    'Salaire', 100, '2026-11-01', undefined, 'recurring', 'income', 'user', 'destination',
  ]);
  expect(query.mock.calls[3]?.[1]).toEqual(['income', 'month', 1, '2026-11-01', null]);
  expect(res.json).toHaveBeenCalledWith({ id: 'income', account_id: 'destination' });
});

it('rejects a destination account belonging to another user without modifying the income', async () => {
  query.mockResolvedValueOnce({ rowCount: 0 } as never);
  const res = await modify();
  expect(res.status).toHaveBeenCalledWith(403);
  expect(query).toHaveBeenCalledTimes(1);
});

it('removes recurrence when converting to a one-off income', async () => {
  query.mockResolvedValueOnce({ rowCount: 1 } as never)
    .mockResolvedValueOnce({ rows: [{ id: 'income' }] } as never)
    .mockResolvedValueOnce({ rowCount: 1 } as never);
  await modify({ duration_type: 'once' });
  expect(query.mock.calls[2]?.[0]).toContain('DELETE FROM recurrence_rules');
});
