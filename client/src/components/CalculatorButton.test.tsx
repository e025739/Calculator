import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorButton } from './CalculatorButton';

describe('CalculatorButton', () => {
  it('renders with the given label', () => {
    render(<CalculatorButton label="5" type="digit" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CalculatorButton label="7" type="digit" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: '7' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('uses ariaLabel when provided', () => {
    render(<CalculatorButton label="+" type="operator" onClick={() => {}} ariaLabel="add" />);
    expect(screen.getByRole('button', { name: 'add' })).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<CalculatorButton label="5" type="digit" onClick={() => {}} disabled />);
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CalculatorButton label="5" type="digit" onClick={onClick} disabled />);

    await user.click(screen.getByRole('button', { name: '5' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
