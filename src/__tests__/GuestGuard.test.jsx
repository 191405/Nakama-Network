/**
 * GuestGuard — Component Tests
 * 
 * Tests that the GuestGuard properly gates content
 * based on authentication state.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// We'll dynamically mock the auth state for each test
const mockAuth = {
  isAuthenticated: false,
  isGuest: false,
  currentUser: null,
  openAuthModal: vi.fn(),
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

import GuestGuard from '../components/GuestGuard';

function renderGuard(children = <div data-testid="protected">Secret Content</div>) {
  return render(
    <BrowserRouter>
      <GuestGuard>{children}</GuestGuard>
    </BrowserRouter>
  );
}

describe('GuestGuard', () => {
  it('renders without crashing', () => {
    const { container } = renderGuard();
    expect(container).toBeTruthy();
  });

  it('blocks content when user is not authenticated', () => {
    mockAuth.isAuthenticated = false;
    mockAuth.isGuest = false;
    renderGuard();

    // Protected content should not be visible
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('shows content when user is authenticated', () => {
    mockAuth.isAuthenticated = true;
    mockAuth.isGuest = false;
    mockAuth.currentUser = { uid: 'user123', displayName: 'TestUser' };
    renderGuard();

    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });
});
