import { describe, it, expect } from 'vitest';
import { calculatorReducer, initialState, MAX_DISPLAY_LENGTH } from './useCalculator';
import type { CalculatorState } from './useCalculator';

describe('calculatorReducer', () => {
  describe('DIGIT_PRESSED', () => {
    it('replaces initial 0 with the pressed digit', () => {
      const result = calculatorReducer(initialState, { type: 'DIGIT_PRESSED', digit: '5' });
      expect(result.display).toBe('5');
    });

    it('appends digit to existing display', () => {
      const state: CalculatorState = { ...initialState, display: '12' };
      const result = calculatorReducer(state, { type: 'DIGIT_PRESSED', digit: '3' });
      expect(result.display).toBe('123');
    });

    it('ignores digit when display is at max length', () => {
      const state: CalculatorState = { ...initialState, display: '1'.repeat(MAX_DISPLAY_LENGTH) };
      const result = calculatorReducer(state, { type: 'DIGIT_PRESSED', digit: '9' });
      expect(result.display).toBe('1'.repeat(MAX_DISPLAY_LENGTH));
    });

    it('starts new number when waiting for operand', () => {
      const state: CalculatorState = {
        ...initialState,
        display: '5',
        operands: [5],
        operators: ['+'],
        waitingForOperand: true,
      };
      const result = calculatorReducer(state, { type: 'DIGIT_PRESSED', digit: '3' });
      expect(result.display).toBe('3');
      expect(result.waitingForOperand).toBe(false);
    });

    it('clears error on digit press', () => {
      const state: CalculatorState = { ...initialState, error: 'some error' };
      const result = calculatorReducer(state, { type: 'DIGIT_PRESSED', digit: '1' });
      expect(result.error).toBeNull();
    });
  });

  describe('DECIMAL_PRESSED', () => {
    it('appends decimal point to display', () => {
      const state: CalculatorState = { ...initialState, display: '5' };
      const result = calculatorReducer(state, { type: 'DECIMAL_PRESSED' });
      expect(result.display).toBe('5.');
    });

    it('does not add a second decimal point', () => {
      const state: CalculatorState = { ...initialState, display: '5.3' };
      const result = calculatorReducer(state, { type: 'DECIMAL_PRESSED' });
      expect(result.display).toBe('5.3');
    });

    it('ignores decimal when display is at max length', () => {
      const state: CalculatorState = { ...initialState, display: '1'.repeat(MAX_DISPLAY_LENGTH) };
      const result = calculatorReducer(state, { type: 'DECIMAL_PRESSED' });
      expect(result.display).toBe('1'.repeat(MAX_DISPLAY_LENGTH));
    });

    it('starts with 0. when waiting for operand', () => {
      const state: CalculatorState = {
        ...initialState,
        waitingForOperand: true,
        operands: [5],
        operators: ['+'],
      };
      const result = calculatorReducer(state, { type: 'DECIMAL_PRESSED' });
      expect(result.display).toBe('0.');
      expect(result.waitingForOperand).toBe(false);
    });
  });

  describe('OPERATOR_PRESSED', () => {
    it('stores current display as operand and sets operator', () => {
      const state: CalculatorState = { ...initialState, display: '7' };
      const result = calculatorReducer(state, { type: 'OPERATOR_PRESSED', operator: '+' });
      expect(result.operands).toEqual([7]);
      expect(result.operators).toEqual(['+']);
      expect(result.waitingForOperand).toBe(true);
    });

    it('replaces last operator when pressing operator consecutively', () => {
      const state: CalculatorState = {
        ...initialState,
        display: '7',
        operands: [7],
        operators: ['+'],
        waitingForOperand: true,
      };
      const result = calculatorReducer(state, { type: 'OPERATOR_PRESSED', operator: '-' });
      expect(result.operators).toEqual(['-']);
      expect(result.operands).toEqual([7]);
    });

    it('handles chained operations (e.g. 5 + 3 *)', () => {
      const state: CalculatorState = {
        ...initialState,
        display: '3',
        operands: [5],
        operators: ['+'],
        waitingForOperand: false,
      };
      const result = calculatorReducer(state, { type: 'OPERATOR_PRESSED', operator: '*' });
      expect(result.operands).toEqual([5, 3]);
      expect(result.operators).toEqual(['+', '*']);
      expect(result.waitingForOperand).toBe(true);
    });
  });

  describe('EQUALS_RESULT', () => {
    it('resets state and sets display to result', () => {
      const state: CalculatorState = {
        ...initialState,
        display: '3',
        operands: [5],
        operators: ['+'],
      };
      const result = calculatorReducer(state, { type: 'EQUALS_RESULT', result: 8 });
      expect(result.display).toBe('8');
      expect(result.operands).toEqual([]);
      expect(result.operators).toEqual([]);
      expect(result.waitingForOperand).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('CLEAR', () => {
    it('resets to initial state', () => {
      const state: CalculatorState = {
        display: '42',
        operands: [10, 20],
        operators: ['+', '*'],
        waitingForOperand: true,
        error: 'some error',
      };
      const result = calculatorReducer(state, { type: 'CLEAR' });
      expect(result).toEqual(initialState);
    });
  });

  describe('ERROR', () => {
    it('sets error message', () => {
      const result = calculatorReducer(initialState, { type: 'ERROR', message: 'Division by zero' });
      expect(result.error).toBe('Division by zero');
    });
  });

  describe('CLEAR_ERROR', () => {
    it('clears error message', () => {
      const state: CalculatorState = { ...initialState, error: 'Some error' };
      const result = calculatorReducer(state, { type: 'CLEAR_ERROR' });
      expect(result.error).toBeNull();
    });
  });

  describe('MEMORY_RECALL', () => {
    it('sets display to the recalled value', () => {
      const result = calculatorReducer(initialState, { type: 'MEMORY_RECALL', value: 42 });
      expect(result.display).toBe('42');
      expect(result.waitingForOperand).toBe(false);
      expect(result.error).toBeNull();
    });
  });
});
