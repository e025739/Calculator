import { useReducer, useEffect, useState, useMemo, useCallback } from 'react';
import * as api from '../services/apiService';
import type { Operator, Digit } from '../types/calculator.types';

/** Discriminated union for all calculator actions — provides full type safety */
export type CalculatorAction =
  | { type: 'DIGIT_PRESSED'; digit: Digit }
  | { type: 'OPERATOR_PRESSED'; operator: Operator }
  | { type: 'DECIMAL_PRESSED' }
  | { type: 'EQUALS_RESULT'; result: number }
  | { type: 'CLEAR' }
  | { type: 'ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'MEMORY_RECALL'; value: number };

export interface CalculatorState {
  display: string;
  operands: number[];
  operators: Operator[];
  waitingForOperand: boolean;
  error: string | null;
}

export const INCOMPLETE_EXPRESSION_ERROR = 'Incomplete expression';
export const MAX_DISPLAY_LENGTH = 16;

export const initialState: CalculatorState = {
  display: '0',
  operands: [],
  operators: [],
  waitingForOperand: false,
  error: null,
};

/** Pure function — all state transitions in one place, easy to test in isolation */
export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'DIGIT_PRESSED':
      if (state.waitingForOperand) {
        return { ...state, display: action.digit, waitingForOperand: false, error: null };
      }
      if (state.display.length >= MAX_DISPLAY_LENGTH) return state;
      return {
        ...state,
        display: state.display === '0' ? action.digit : state.display + action.digit,
        error: null,
      };

    case 'DECIMAL_PRESSED':
      if (state.waitingForOperand) {
        return { ...state, display: '0.', waitingForOperand: false, error: null };
      }
      if (state.display.includes('.')) return state;
      if (state.display.length >= MAX_DISPLAY_LENGTH) return state;
      return { ...state, display: state.display + '.', error: null };

    case 'OPERATOR_PRESSED':
      // If already waiting for operand, replace the last operator (e.g., 5 + - becomes 5 -)
      if (state.waitingForOperand) {
        const updatedOperators = [...state.operators];
        updatedOperators[updatedOperators.length - 1] = action.operator;
        return { ...state, operators: updatedOperators, error: null };
      }
      return {
        ...state,
        operands: [...state.operands, parseFloat(state.display)],
        operators: [...state.operators, action.operator],
        waitingForOperand: true,
        error: null,
      };

    case 'EQUALS_RESULT':
      return {
        display: String(action.result),
        operands: [],
        operators: [],
        waitingForOperand: false,
        error: null,
      };

    case 'CLEAR':
      return initialState;

    case 'ERROR':
      return { ...state, error: action.message };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'MEMORY_RECALL':
      return { ...state, display: String(action.value), waitingForOperand: false, error: null };

    default:
      return state;
  }
}

/** Describes the public API of the useCalculator hook */
interface UseCalculatorReturn {
  display: string;
  activeOperator: Operator | null;
  error: string | null;
  expression: string;
  memoryValue: number;
  isCalculating: boolean;
  handleDigit: (digit: Digit) => void;
  handleDecimal: () => void;
  handleOperator: (op: Operator) => void;
  handleEquals: () => void;
  handleClear: () => void;
  handleMemoryRecall: () => void;
  handleMemoryAdd: () => void;
  handleMemorySubtract: () => void;
  handleMemoryClear: () => void;
}

export function useCalculator(): UseCalculatorReturn {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Derived values — computed from state, not stored
  const expression = useMemo(() => {
    if (state.operands.length === 0) return '';
    const parts = state.operands.map((n, i) => `${n} ${state.operators[i] ?? ''}`).join(' ').trim();
    return state.waitingForOperand ? parts : `${parts} ${state.display}`;
  }, [state.operands, state.operators, state.waitingForOperand, state.display]);

  const activeOperator: Operator | null = state.operators[state.operators.length - 1] ?? null;

  // Auto-clear errors after 3 seconds
  useEffect(() => {
    if (!state.error) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 3000);
    return () => clearTimeout(timer);
  }, [state.error]);

  // Fetch memory value on mount (with cleanup for StrictMode double-mount)
  useEffect(() => {
    const controller = new AbortController();
    api.getMemory()
      .then(value => { if (!controller.signal.aborted) setMemoryValue(value); })
      .catch(() => { if (!controller.signal.aborted) dispatch({ type: 'ERROR', message: 'Failed to load memory' }); });
    return () => controller.abort();
  }, []);

  const refreshMemory = async () => {
    const value = await api.getMemory();
    setMemoryValue(value);
    return value;
  };

  const handleDigit = useCallback((digit: Digit) => dispatch({ type: 'DIGIT_PRESSED', digit }), []);
  const handleDecimal = useCallback(() => dispatch({ type: 'DECIMAL_PRESSED' }), []);
  const handleOperator = useCallback((op: Operator) => dispatch({ type: 'OPERATOR_PRESSED', operator: op }), []);
  const handleClear = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  /** Resolves the current value: if there's a pending expression, calculates it; otherwise returns the display value */
  const resolveCurrentValue = async (): Promise<number> => {
    if (state.operators.length > 0 && !state.waitingForOperand) {
      const allOperands = [...state.operands, parseFloat(state.display)];
      const result = await api.calculate({ operands: allOperands, operators: state.operators });
      return result.result;
    }
    return parseFloat(state.display);
  };

  const handleEquals = async () => {
    if (isCalculating || state.operators.length === 0) return;
    if (state.waitingForOperand) {
      dispatch({ type: 'ERROR', message: INCOMPLETE_EXPRESSION_ERROR });
      return;
    }

    setIsCalculating(true);
    try {
      const result = await resolveCurrentValue();
      dispatch({ type: 'EQUALS_RESULT', result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      dispatch({ type: 'ERROR', message });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMemoryRecall = async () => {
    setIsCalculating(true);
    try {
      const value = await refreshMemory();
      dispatch({ type: 'MEMORY_RECALL', value });
    } catch {
      dispatch({ type: 'ERROR', message: 'Memory error' });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMemoryOperation = async (operation: 'add' | 'subtract') => {
    setIsCalculating(true);
    try {
      const valueToStore = await resolveCurrentValue();
      const memoryFn = operation === 'add' ? api.addToMemory : api.subtractFromMemory;
      await memoryFn(valueToStore);
      await refreshMemory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Memory error';
      dispatch({ type: 'ERROR', message });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMemoryAdd = () => handleMemoryOperation('add');
  const handleMemorySubtract = () => handleMemoryOperation('subtract');

  const handleMemoryClear = async () => {
    setIsCalculating(true);
    try {
      await api.clearMemory();
      await refreshMemory();
    } catch {
      dispatch({ type: 'ERROR', message: 'Memory error' });
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    display: state.display,
    activeOperator,
    error: state.error,
    expression,
    memoryValue,
    isCalculating,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleClear,
    handleMemoryRecall,
    handleMemoryAdd,
    handleMemorySubtract,
    handleMemoryClear,
  };
}
