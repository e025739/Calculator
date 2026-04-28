import { useEffect } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { CalculatorButton } from './CalculatorButton';
import type { Operator, Digit } from '../types/calculator.types';
import styles from './Calculator.module.css';

const DIGITS = new Set<string>(['0','1','2','3','4','5','6','7','8','9']);
const OPERATORS = new Set<string>(['+','-','*','/']);

const OPERATOR_LABELS: Record<Operator, string> = { '/': '/', '*': '×', '-': '−', '+': '+' };
const OPERATOR_ARIA: Record<Operator, string> = { '/': 'divide', '*': 'multiply', '-': 'subtract', '+': 'add' };

const DIGIT_ROWS: Digit[][] = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];
const ROW_OPERATORS: Operator[] = ['/', '*', '-'];

/**
 * Calculator UI component.
 * All logic is handled by the useCalculator hook — this component only renders buttons and display.
 */
function Calculator() {
  const {
    display,
    activeOperator,
    error,
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
  } = useCalculator();

  // Keyboard support — maps physical keys to existing calculator handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCalculating) return;

      if (DIGITS.has(e.key)) {
        handleDigit(e.key as Digit);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (OPERATORS.has(e.key)) {
        handleOperator(e.key as Operator);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalculating, handleDigit, handleDecimal, handleOperator, handleEquals, handleClear]);

  return (
    <div className={styles.calculator}>
      {/* Display area — shows current number or error message */}
      <div className={styles.display}>
        <div className={styles.memoryDisplay}>M : {memoryValue}</div>
        {error && <div className={styles.error}>{error}</div>}
        {expression && <div className={styles.expression}>{expression}</div>}
        <div className={styles.value}>{display}</div>
      </div>

      <fieldset className={styles.keypad} disabled={isCalculating}>
        {/* Memory buttons row */}
        <div className={`${styles.row} ${styles.memoryRow}`}>
          <CalculatorButton label="MR" type="memory" onClick={handleMemoryRecall} ariaLabel="memory recall" />
          <CalculatorButton label="M+" type="memory" onClick={handleMemoryAdd} ariaLabel="memory add" />
          <CalculatorButton label="M-" type="memory" onClick={handleMemorySubtract} ariaLabel="memory subtract" />
          <CalculatorButton label="MC" type="memory" onClick={handleMemoryClear} ariaLabel="memory clear" />
          <CalculatorButton label="C" type="clear" onClick={handleClear} ariaLabel="clear" />
        </div>

        {/* Number pad rows (7-9, 4-6, 1-3) with operators */}
        {DIGIT_ROWS.map((row, i) => (
          <div key={i} className={styles.row}>
            {row.map(digit => (
              <CalculatorButton key={digit} label={digit} type="digit" onClick={() => handleDigit(digit)} />
            ))}
            <CalculatorButton
              label={OPERATOR_LABELS[ROW_OPERATORS[i]]}
              type="operator"
              onClick={() => handleOperator(ROW_OPERATORS[i])}
              isActive={activeOperator === ROW_OPERATORS[i]}
              ariaLabel={OPERATOR_ARIA[ROW_OPERATORS[i]]}
            />
          </div>
        ))}

        {/* Bottom row: 0, decimal, equals, + */}
        <div className={styles.row}>
          <CalculatorButton label="0" type="digit" onClick={() => handleDigit('0')} />
          <CalculatorButton label="." type="digit" onClick={handleDecimal} ariaLabel="decimal point" />
          <CalculatorButton label="=" type="equals" onClick={handleEquals} ariaLabel="equals" />
          <CalculatorButton
            label="+"
            type="operator"
            onClick={() => handleOperator('+')}
            isActive={activeOperator === '+'}
            ariaLabel="add"
          />
        </div>
      </fieldset>
    </div>
  );
}

export default Calculator;
