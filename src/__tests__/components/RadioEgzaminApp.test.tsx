import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioEgzaminApp } from '@/components/RadioEgzaminApp';

describe('RadioEgzaminApp', () => {
  it('renders exam mode by default', () => {
    render(<RadioEgzaminApp />);
    expect(screen.getByRole('heading', { name: /Świadectwo klasy A/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Egzamin' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to handbook mode', async () => {
    const user = userEvent.setup();
    render(<RadioEgzaminApp />);
    await user.click(screen.getByRole('tab', { name: 'Podręcznik' }));
    expect(screen.getByRole('tab', { name: 'Podręcznik' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('navigation', { name: 'Tematy podręcznika' })).toBeInTheDocument();
  });
});
