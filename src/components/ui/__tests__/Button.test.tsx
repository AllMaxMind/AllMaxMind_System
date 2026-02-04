import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
  it('should render children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<Button loading>Submit</Button>);

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply variant classes', () => {
    const { container } = render(<Button variant="secondary">Delete</Button>);
    const button = container.firstChild;
    expect(button).toHaveClass('bg-gray-200');
  });

  it('should apply size classes', () => {
    const { container } = render(<Button size="lg">Big Button</Button>);
    const button = container.firstChild;
    expect(button).toHaveClass('px-6 py-3 text-lg');
  });
});