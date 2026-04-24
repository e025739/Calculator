import { useState, useEffect } from 'react';
import * as api from '../services/apiService';

/**
 * Custom hook that encapsulates all calculator logic.
 * The component that uses this hook only handles UI — no business logic.
 */
type Operator = '+' | '-' | '*' | '/';

interface CalculatorState {
  display: string;
  firstOperand: number | null;
  operator: Operator | null;
  waitingForSecondOperand: boolean;
  error: string | null;
  expression: string;
}

const initialState: CalculatorState = {
  display: '0',
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  error: null,
  expression: '',
};

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [memoryValue, setMemoryValue] = useState<number>(0);



  // Fetch memory value on mount
  useEffect(() => {
    api.getMemory()
    .then(setMemoryValue)
    .catch(() => setState(prev => ({ ...prev, error: 'Failed to load memory' })));
  }, []);

  // Appends a digit to the current display value
  const handleDigit = (digit: string) => {
    setState(prev => {
      // After pressing an operator, start fresh for the second operand
      if (prev.waitingForSecondOperand) {
        return { ...prev, display: digit, waitingForSecondOperand: false, error: null };
      }
      // Replace leading zero, otherwise append
      const newDisplay = prev.display === '0' ? digit : prev.display + digit;
      return { ...prev, display: newDisplay, error: null };
    });
  };

  // Adds a decimal point (only one allowed)
  const handleDecimal = () => {
    setState(prev => {
      if (prev.waitingForSecondOperand) {
        return { ...prev, display: '0.', waitingForSecondOperand: false, error: null };
      }
      if (prev.display.includes('.')) return prev;
      return { ...prev, display: prev.display + '.', error: null };
    });
  };

  // Stores the first operand and the chosen operator
  // If there's already a pending operation, calculate it first
  const handleOperator = async (op: Operator) => {
    if (state.firstOperand !== null && state.operator !== null && !state.waitingForSecondOperand) {
      try {
        const result = await api.calculate({
          operand1: state.firstOperand,
          operand2: parseFloat(state.display),
          operator: state.operator,
        });
        setState({
          display: String(result.result),
          firstOperand: result.result,
          operator: op,
          waitingForSecondOperand: true,
          error: null,
          expression: `${result.result} ${op}`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Calculation error';
        setState(prev => ({ ...prev, error: message }));
      }
    } else {
      const operand = parseFloat(state.display);
      setState(prev => ({
        ...prev,
        firstOperand: operand,
        operator: op,
        waitingForSecondOperand: true,
        error: null,
        expression: `${operand} ${op}`,
      }));
    }
  };

  // Sends both operands + operator to the server for calculation
  const handleEquals = async () => {
    if (state.firstOperand === null || state.operator === null) return;

    try {
      const result = await api.calculate({
        operand1: state.firstOperand,
        operand2: parseFloat(state.display),
        operator: state.operator,
      });

      setState({
        display: String(result.result),
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        error: null,
        expression: '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      setState(prev => ({ ...prev, error: message }));
    }
  };

  // Resets the calculator to its initial state
  const handleClear = () => {
    setState(initialState);
  };

  // Memory: recall — replaces display with the stored memory value
  const handleMemoryRecall = async () => {
    try {
      const value = await api.getMemory();
      setMemoryValue(value);
      setState(prev => ({ ...prev, display: String(value), error: null }));
    } catch {
      setState(prev => ({ ...prev, error: 'Memory error' }));
    }
  };

  // Memory: add current display value to server memory
  const handleMemoryAdd = async () => {
    try {
      await api.addToMemory(parseFloat(state.display));
      const value = await api.getMemory();
      setMemoryValue(value);
      setState(prev => ({ ...prev, error: null }));
    } catch {
      setState(prev => ({ ...prev, error: 'Memory error' }));
    }
  };

  // Memory: subtract current display value from server memory
  const handleMemorySubtract = async () => {
    try {
      await api.subtractFromMemory(parseFloat(state.display));
      const value = await api.getMemory();
      setMemoryValue(value);
      setState(prev => ({ ...prev, error: null }));
    } catch {
      setState(prev => ({ ...prev, error: 'Memory error' }));
    }
  };

  return {
    display: state.display,
    operator: state.operator,
    error: state.error,
    expression: state.expression,
    memoryValue,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleClear,
    handleMemoryRecall,
    handleMemoryAdd,
    handleMemorySubtract,
  };
}
