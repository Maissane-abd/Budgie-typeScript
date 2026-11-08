import { describe, expect, it } from 'vitest';
import { isValidPassword } from '../src/utils/passwordPolicy';

describe('registration password policy', () => {
  it.each([
    ['Abcdefghij1!', true],
    ['Une longue phrase 7!', true],
    ['\u00c9tendre la phrase 7!', true],
    ['Abcdefghi1!', false],
    ['une longue phrase 7!', false],
    ['Une longue phrase !', false],
    ['Une longue phrase 7', false],
    ['A1234567890 ', false],
    ['A1!' + 'a'.repeat(69), true],
    ['A1!' + 'a'.repeat(70), false],
    ['A1!' + '\u00e9'.repeat(35), false],
    ['', false],
    [null, false],
    [123456789012, false],
    [{ length: 12 }, false],
  ])('validates case %#', (password, expected) => {
    expect(isValidPassword(password)).toBe(expected);
  });
});
