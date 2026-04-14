/**
 * AuthContext — Unit Tests
 * 
 * Tests the authentication context's pure logic:
 * guest login, logout state, requireAuth gating, etc.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Override the default firebase mock for these specific tests
vi.mock('../utils/firebase', () => ({
  auth: null,
  createUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  subscribeToUserProfile: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user
    callback(null);
    return vi.fn();
  }),
}));

vi.mock('../utils/localDevAuth', () => ({
  isLocalDevMode: () => false,
  getLocalDevUser: vi.fn(),
  clearLocalDevAuth: vi.fn(),
}));

vi.mock('../utils/emailService', () => ({
  sendWelcomeEmail: vi.fn(),
}));

// Test helper that always exposes the latest auth state via a ref
const authRef = { current: null };

function AuthConsumer() {
  const auth = useAuth();
  // Always update the ref on every render so tests see latest state
  authRef.current = auth;
  return <div data-testid="consumer">ready</div>;
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  it('throws when useAuth is called outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      const Broken = () => { useAuth(); return null; };
      render(<Broken />);
    }).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });

  it('initializes with unauthenticated state', async () => {
    renderWithAuth();
    await screen.findByTestId('consumer');

    expect(authRef.current.isAuthenticated).toBe(false);
    expect(authRef.current.isGuest).toBe(false);
    expect(authRef.current.currentUser).toBeNull();
    expect(authRef.current.userProfile).toBeNull();
  });

  it('loginAsGuest sets guest state correctly', async () => {
    renderWithAuth();
    await screen.findByTestId('consumer');

    act(() => {
      authRef.current.loginAsGuest();
    });

    expect(authRef.current.isGuest).toBe(true);
    expect(authRef.current.isAuthenticated).toBe(false);
    expect(authRef.current.currentUser.uid).toBe('guest');
    expect(authRef.current.userProfile.canUseFeatures).toBe(false);
  });

  it('requireAuth opens auth modal when not authenticated', async () => {
    renderWithAuth();
    await screen.findByTestId('consumer');

    act(() => {
      const result = authRef.current.requireAuth(null, 'Please log in');
      expect(result).toBe(false);
    });

    expect(authRef.current.isAuthModalOpen).toBe(true);
    expect(authRef.current.authModalMessage).toBe('Please log in');
  });

  it('canUseFeature returns false when not authenticated', async () => {
    renderWithAuth();
    await screen.findByTestId('consumer');
    expect(authRef.current.canUseFeature()).toBe(false);
  });

  it('logout clears all state', async () => {
    renderWithAuth();
    await screen.findByTestId('consumer');

    // Login as guest first
    act(() => { authRef.current.loginAsGuest(); });
    expect(authRef.current.isGuest).toBe(true);

    // Then logout
    await act(async () => { await authRef.current.logout(); });
    expect(authRef.current.isGuest).toBe(false);
    expect(authRef.current.isAuthenticated).toBe(false);
    expect(authRef.current.currentUser).toBeNull();
    expect(authRef.current.userProfile).toBeNull();
  });

  it('openAuthModal / closeAuthModal toggle modal state', async () => {
    renderWithAuth();
    await screen.findByTestId('consumer');

    act(() => { authRef.current.openAuthModal('Sign up to join'); });
    expect(authRef.current.isAuthModalOpen).toBe(true);
    expect(authRef.current.authModalMessage).toBe('Sign up to join');

    act(() => { authRef.current.closeAuthModal(); });
    expect(authRef.current.isAuthModalOpen).toBe(false);
    expect(authRef.current.authModalMessage).toBe('');
  });
});
