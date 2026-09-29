import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary Unit Tests', () => {
  it('correctly derives error state using getDerivedStateFromError', () => {
    const error = new Error('Test boundary crash');
    const state = ErrorBoundary.getDerivedStateFromError(error);

    expect(state.hasError).toBe(true);
    expect(state.error).toBe(error);
  });

  it('notifies onError callback in componentDidCatch', () => {
    const onErrorMock = vi.fn();
    const boundary = new ErrorBoundary({
      children: null,
      onError: onErrorMock
    });

    const error = new Error('Simulated runtime error');
    const errorInfo = { componentStack: '\n    in ProblematicComponent' };

    boundary.componentDidCatch(error, errorInfo);

    expect(onErrorMock).toHaveBeenCalledWith(error, errorInfo);
  });

  it('resets state when resetErrorBoundary is invoked', () => {
    const onResetMock = vi.fn();
    const boundary = new ErrorBoundary({
      children: null,
      onReset: onResetMock
    });

    // Simulate error state
    boundary.state = {
      hasError: true,
      error: new Error('Runtime fault'),
      errorInfo: { componentStack: 'trace' },
      showDetails: true
    };

    boundary.resetErrorBoundary();

    expect(onResetMock).toHaveBeenCalled();
    expect(boundary.state.hasError).toBe(false);
    expect(boundary.state.error).toBeNull();
    expect(boundary.state.showDetails).toBe(false);
  });
});
