import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculate, getMemory, addToMemory, subtractFromMemory, clearMemory } from './apiService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

function errorResponse(status: number, body?: unknown) {
  return {
    ok: false,
    status,
    json: () => (body ? Promise.resolve(body) : Promise.reject(new Error('no json'))),
    text: () => Promise.resolve(body ? JSON.stringify(body) : ''),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiService', () => {
  describe('calculate', () => {
    it('sends a POST request with operands and operators', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ result: 8 }));

      const result = await calculate({ operands: [5, 3], operators: ['+'] });

      expect(result).toEqual({ result: 8 });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calculator/calculate'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operands: [5, 3], operators: ['+'] }),
        }),
      );
    });

    it('throws on server error with detail message', async () => {
      mockFetch.mockResolvedValue(errorResponse(400, { detail: 'Division by zero' }));

      await expect(calculate({ operands: [5, 0], operators: ['/'] })).rejects.toThrow('Division by zero');
    });

    it('throws fallback message when error body is not JSON', async () => {
      mockFetch.mockResolvedValue(errorResponse(500));

      await expect(calculate({ operands: [1], operators: [] })).rejects.toThrow('Request failed (500)');
    });
  });

  describe('getMemory', () => {
    it('returns the memory value', async () => {
      mockFetch.mockResolvedValue(jsonResponse(42));

      const result = await getMemory();
      expect(result).toBe(42);
    });
  });

  describe('addToMemory', () => {
    it('sends POST with value', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('') });

      await addToMemory(10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calculator/memory/add'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ value: 10 }),
        }),
      );
    });
  });

  describe('subtractFromMemory', () => {
    it('sends POST with value', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('') });

      await subtractFromMemory(5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calculator/memory/subtract'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ value: 5 }),
        }),
      );
    });
  });

  describe('clearMemory', () => {
    it('sends POST to clear endpoint', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('') });

      await clearMemory();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calculator/memory/clear'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
