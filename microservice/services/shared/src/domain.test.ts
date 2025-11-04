import { describe, expect, it } from 'vitest';
import { bookSchema, seedBooks, salesStatusSchema } from './index.js';

describe('domain schemas', () => {
  it('parses seed books using schema', () => {
    const parsed = bookSchema.array().parse(seedBooks);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('rejects invalid sales status', () => {
    expect(() => salesStatusSchema.parse('invalid')).toThrowError();
  });
});
