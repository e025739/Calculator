import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calculator from './Calculator';
import * as api from '../services/apiService';
import { INCOMPLETE_EXPRESSION_ERROR } from '../hooks/useCalculator';

vi.mock('../services/apiService');
const mockedApi = vi.mocked(api);

/** Helper: get the display value element */
function getDisplayValue() {
  return document.querySelector('.value')!;
}

beforeEach(() => {
  vi.resetAllMocks();
  mockedApi.getMemory.mockResolvedValue(0);
});

describe('Calculator', () => {
  it('renders display with initial value 0', () => {
    render(<Calculator />);
    expect(getDisplayValue()).toHaveTextContent('0');
  });

  it('renders all digit buttons', () => {
    render(<Calculator />);
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('renders operator buttons', () => {
    render(<Calculator />);
    expect(screen.getByRole('button', { name: 'divide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'multiply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'subtract' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'add' })).toBeInTheDocument();
  });

  it('renders memory buttons', () => {
    render(<Calculator />);
    expect(screen.getByRole('button', { name: 'memory recall' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'memory add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'memory subtract' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'memory clear' })).toBeInTheDocument();
  });

  it('updates display when clicking digit buttons', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '3' }));

    expect(getDisplayValue()).toHaveTextContent('53');
  });

  it('performs a full calculation flow', async () => {
    mockedApi.calculate.mockResolvedValue({ result: 8 });
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    await vi.waitFor(() => {
      expect(getDisplayValue()).toHaveTextContent('8');
    });
  });

  it('clears the display when pressing C', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: 'clear' }));

    expect(getDisplayValue()).toHaveTextContent('0');
  });

  it('handles decimal point', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'decimal point' }));
    await user.click(screen.getByRole('button', { name: '5' }));

    expect(getDisplayValue()).toHaveTextContent('3.5');
  });

  it('shows error message on API failure', async () => {
    mockedApi.calculate.mockRejectedValue(new Error('Server unavailable'));
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    expect(await screen.findByText('Server unavailable')).toBeInTheDocument();
  });

  it('shows error when pressing equals on incomplete expression', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: 'subtract' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    expect(await screen.findByText(INCOMPLETE_EXPRESSION_ERROR)).toBeInTheDocument();
    expect(getDisplayValue()).toHaveTextContent('9');
  });

  describe('keyboard support', () => {
    it('updates display when pressing digit keys', async () => {
      const user = userEvent.setup();
      render(<Calculator />);

      await user.keyboard('42');

      expect(getDisplayValue()).toHaveTextContent('42');
    });

    it('handles operator and equals keys for a full calculation', async () => {
      mockedApi.calculate.mockResolvedValue({ result: 8 });
      const user = userEvent.setup();
      render(<Calculator />);

      await user.keyboard('5+3');
      await user.keyboard('{Enter}');

      await vi.waitFor(() => {
        expect(getDisplayValue()).toHaveTextContent('8');
      });
    });

    it('clears display on Escape key', async () => {
      const user = userEvent.setup();
      render(<Calculator />);

      await user.keyboard('9');
      expect(getDisplayValue()).toHaveTextContent('9');

      await user.keyboard('{Escape}');
      expect(getDisplayValue()).toHaveTextContent('0');
    });

    it('handles decimal point key', async () => {
      const user = userEvent.setup();
      render(<Calculator />);

      await user.keyboard('3.5');

      expect(getDisplayValue()).toHaveTextContent('3.5');
    });

    it('ignores irrelevant keys', async () => {
      const user = userEvent.setup();
      render(<Calculator />);

      await user.keyboard('5abc');

      expect(getDisplayValue()).toHaveTextContent('5');
    });
  });
});
