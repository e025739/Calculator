import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCalculator, INCOMPLETE_EXPRESSION_ERROR } from './useCalculator';
import * as api from '../services/apiService';

vi.mock('../services/apiService');
const mockedApi = vi.mocked(api);

beforeEach(() => {
  vi.resetAllMocks();
  mockedApi.getMemory.mockResolvedValue(0);
});

describe('useCalculator', () => {
  it('initializes with display 0', async () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.display).toBe('0');
    expect(result.current.error).toBeNull();
  });

  it('updates display when pressing digits', async () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    expect(result.current.display).toBe('5');

    act(() => result.current.handleDigit('3'));
    expect(result.current.display).toBe('53');
  });

  it('handles decimal point', async () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('3'));
    act(() => result.current.handleDecimal());
    act(() => result.current.handleDigit('5'));
    expect(result.current.display).toBe('3.5');
  });

  it('sets activeOperator when operator is pressed', async () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    act(() => result.current.handleOperator('+'));
    expect(result.current.activeOperator).toBe('+');
  });

  it('builds expression string', async () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    act(() => result.current.handleOperator('+'));
    act(() => result.current.handleDigit('3'));
    expect(result.current.expression).toBe('5 + 3');
  });

  it('calls API and sets result on equals', async () => {
    mockedApi.calculate.mockResolvedValue({ result: 8 });

    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    act(() => result.current.handleOperator('+'));
    act(() => result.current.handleDigit('3'));

    await act(async () => result.current.handleEquals());

    expect(mockedApi.calculate).toHaveBeenCalledWith({
      operands: [5, 3],
      operators: ['+'],
    });
    expect(result.current.display).toBe('8');
    expect(result.current.expression).toBe('');
  });

  it('shows error when calculation fails', async () => {
    mockedApi.calculate.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    act(() => result.current.handleOperator('+'));
    act(() => result.current.handleDigit('3'));

    await act(async () => result.current.handleEquals());

    expect(result.current.error).toBe('Server error');
  });

  it('does not call equals when no operator', async () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    await act(async () => result.current.handleEquals());

    expect(mockedApi.calculate).not.toHaveBeenCalled();
  });

  it('clears state on handleClear', async () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.handleDigit('5'));
    act(() => result.current.handleOperator('+'));
    act(() => result.current.handleClear());

    expect(result.current.display).toBe('0');
    expect(result.current.expression).toBe('');
    expect(result.current.activeOperator).toBeNull();
  });

  describe('memory operations', () => {
    it('recalls memory value from API', async () => {
      mockedApi.getMemory.mockResolvedValue(42);

      const { result } = renderHook(() => useCalculator());

      await act(async () => result.current.handleMemoryRecall());

      expect(result.current.display).toBe('42');
    });

    it('adds current value to memory', async () => {
      mockedApi.addToMemory.mockResolvedValue(undefined);
      mockedApi.getMemory.mockResolvedValue(5);

      const { result } = renderHook(() => useCalculator());

      act(() => result.current.handleDigit('5'));
      await act(async () => result.current.handleMemoryAdd());

      expect(mockedApi.addToMemory).toHaveBeenCalledWith(5);
    });

    it('subtracts current value from memory', async () => {
      mockedApi.subtractFromMemory.mockResolvedValue(undefined);
      mockedApi.getMemory.mockResolvedValue(-3);

      const { result } = renderHook(() => useCalculator());

      act(() => result.current.handleDigit('3'));
      await act(async () => result.current.handleMemorySubtract());

      expect(mockedApi.subtractFromMemory).toHaveBeenCalledWith(3);
    });

    it('clears memory', async () => {
      mockedApi.clearMemory.mockResolvedValue(undefined);
      mockedApi.getMemory.mockResolvedValue(0);

      const { result } = renderHook(() => useCalculator());

      await act(async () => result.current.handleMemoryClear());

      expect(mockedApi.clearMemory).toHaveBeenCalled();
    });
  });

  it('fetches memory on mount', async () => {
    mockedApi.getMemory.mockResolvedValue(10);

    const { result } = renderHook(() => useCalculator());

    await waitFor(() => {
      expect(result.current.memoryValue).toBe(10);
    });
  });

  describe('incomplete expression', () => {
    it('shows error when equals pressed after single operator (8 + =)', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.handleDigit('8'));
      act(() => result.current.handleOperator('+'));
      await act(async () => result.current.handleEquals());

      expect(result.current.error).toBe(INCOMPLETE_EXPRESSION_ERROR);
      expect(result.current.display).toBe('8');
    });

    it('shows error when equals pressed after chained operators (8 + 9 - =)', async () => {
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.handleDigit('8'));
      act(() => result.current.handleOperator('+'));
      act(() => result.current.handleDigit('9'));
      act(() => result.current.handleOperator('-'));
      await act(async () => result.current.handleEquals());

      expect(result.current.error).toBe(INCOMPLETE_EXPRESSION_ERROR);
      expect(result.current.display).toBe('9');
      expect(mockedApi.calculate).not.toHaveBeenCalled();
    });

    it('recovers after error: 8 + 9 - = (error) then 2 = gives 15', async () => {
      mockedApi.calculate.mockResolvedValue({ result: 15 });
      const { result } = renderHook(() => useCalculator());

      act(() => result.current.handleDigit('8'));
      act(() => result.current.handleOperator('+'));
      act(() => result.current.handleDigit('9'));
      act(() => result.current.handleOperator('-'));
      await act(async () => result.current.handleEquals());

      expect(result.current.error).toBe(INCOMPLETE_EXPRESSION_ERROR);

      act(() => result.current.handleDigit('2'));
      await act(async () => result.current.handleEquals());

      expect(result.current.display).toBe('15');
      expect(mockedApi.calculate).toHaveBeenCalledWith({
        operands: [8, 9, 2],
        operators: ['+', '-'],
      });
    });
  });

  describe('server errors', () => {
    it('shows division by zero error from server', async () => {
      mockedApi.calculate.mockRejectedValue(new Error('Cannot divide by zero.'));

      const { result } = renderHook(() => useCalculator());

      act(() => result.current.handleDigit('5'));
      act(() => result.current.handleOperator('/'));
      act(() => result.current.handleDigit('0'));
      await act(async () => result.current.handleEquals());

      expect(result.current.error).toBe('Cannot divide by zero.');
      expect(result.current.display).toBe('0');
    });
  });
});
