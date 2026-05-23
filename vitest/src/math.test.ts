import { describe, it, expect } from 'vitest';

// Inline helpers — production code would be imported from your app.
function add(a: number, b: number) {
  return a + b;
}
function divide(a: number, b: number) {
  if (b === 0) throw new Error('division by zero');
  return a / b;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

describe('math @unit', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('handles negative operands', () => {
    expect(add(-1, 1)).toBe(0);
  });

  it('divides evenly', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('throws on division by zero', () => {
    expect(() => divide(1, 0)).toThrow('division by zero');
  });
});

describe('slugify @unit', () => {
  it('lowercases and replaces spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips special characters', () => {
    expect(slugify('Foo & Bar!')).toBe('foo--bar');
  });

  it('handles already-slugified input', () => {
    expect(slugify('already-fine')).toBe('already-fine');
  });
});
