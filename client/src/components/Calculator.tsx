import { useCalculator } from '../hooks/useCalculator';
import styles from './Calculator.module.css';

/**
 * Calculator UI component.
 * All logic is handled by the useCalculator hook — this component only renders buttons and display.
 */
const Calculator: React.FC = () => {
  const {
    display,
    operator,
    error,
    expression,
    memoryValue,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleClear,
    handleMemoryRecall,
    handleMemoryAdd,
    handleMemorySubtract,
  } = useCalculator();

  return (
    <div className={styles.calculator}>
      {/* Display area — shows current number or error message */}
      <div className={styles.display}>
        <div className={styles.memoryDisplay}>M : {memoryValue}</div>
        {error && <div className={styles.error}>{error}</div>}
        {expression && <div className={styles.expression}>{expression}</div>}
        <div className={styles.value}>{display}</div>
      </div>

      {/* Memory buttons row */}
      <div className={styles.row}>
        <button className={styles.memoryBtn} onClick={handleMemoryRecall}>M</button>
        <button className={styles.memoryBtn} onClick={handleMemoryAdd}>+M</button>
        <button className={styles.memoryBtn} onClick={handleMemorySubtract}>-M</button>
        <button className={styles.clearBtn} onClick={handleClear}>C</button>
      </div>

      {/* Number pad + operators */}
      <div className={styles.row}>
        <button className={styles.digitBtn} onClick={() => handleDigit('7')}>7</button>
        <button className={styles.digitBtn} onClick={() => handleDigit('8')}>8</button>
        <button className={styles.digitBtn} onClick={() => handleDigit('9')}>9</button>
        <button className={`${styles.operatorBtn} ${operator === '/' ? styles.active : ''}`} onClick={() => handleOperator('/')}>/</button>
      </div>

      <div className={styles.row}>
        <button className={styles.digitBtn} onClick={() => handleDigit('4')}>4</button>
        <button className={styles.digitBtn} onClick={() => handleDigit('5')}>5</button>
        <button className={styles.digitBtn} onClick={() => handleDigit('6')}>6</button>
        <button className={`${styles.operatorBtn} ${operator === '*' ? styles.active : ''}`} onClick={() => handleOperator('*')}>×</button>
      </div>

      <div className={styles.row}>
        <button className={styles.digitBtn} onClick={() => handleDigit('1')}>1</button>
        <button className={styles.digitBtn} onClick={() => handleDigit('2')}>2</button>
        <button className={styles.digitBtn} onClick={() => handleDigit('3')}>3</button>
        <button className={`${styles.operatorBtn} ${operator === '-' ? styles.active : ''}`} onClick={() => handleOperator('-')}>−</button>
      </div>

      <div className={styles.row}>
        <button className={styles.digitBtn} onClick={() => handleDigit('0')}>0</button>
        <button className={styles.digitBtn} onClick={handleDecimal}>.</button>
        <button className={styles.equalsBtn} onClick={handleEquals}>=</button>
        <button className={`${styles.operatorBtn} ${operator === '+' ? styles.active : ''}`} onClick={() => handleOperator('+')}>+</button>
      </div>
    </div>
  );
};

export default Calculator;
