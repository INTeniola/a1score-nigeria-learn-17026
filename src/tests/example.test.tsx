import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const text = 'Hello World';
    expect(text).toContain('Hello');
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
