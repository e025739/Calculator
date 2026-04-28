import styles from './Calculator.module.css';

type ButtonType = 'digit' | 'operator' | 'memory' | 'clear' | 'equals';

interface CalculatorButtonProps {
  label: string;
  type: ButtonType;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

const styleMap: Record<ButtonType, string> = {
  digit: styles.digitBtn,
  operator: styles.operatorBtn,
  memory: styles.memoryBtn,
  clear: styles.clearBtn,
  equals: styles.equalsBtn,
};

export function CalculatorButton({ label, type, onClick, isActive, disabled, ariaLabel }: CalculatorButtonProps) {
  const className = `${styleMap[type]}${isActive ? ` ${styles.active}` : ''}`;

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}
