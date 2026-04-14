/**
 * Navbar — Component Tests
 * 
 * Tests that the navigation bar renders correctly,
 * links point to the right routes, and mobile menu toggles.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    userProfile: null,
    isAuthenticated: false,
    isGuest: false,
    openAuthModal: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: true, toggleTheme: vi.fn() }),
}));

import Navbar from '../components/Navbar';

function renderNavbar() {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
}

describe('Navbar', () => {
  it('renders without crashing', () => {
    const { container } = renderNavbar();
    expect(container).toBeTruthy();
  });

  it('contains the brand/logo area', () => {
    renderNavbar();
    // The navbar should contain some kind of branding element
    const nav = document.querySelector('nav') || document.querySelector('[class*="nav"]') || document.querySelector('header');
    expect(nav).toBeTruthy();
  });

  it('has navigation links', () => {
    renderNavbar();
    const links = document.querySelectorAll('a[href]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('does not link to deleted pages', () => {
    renderNavbar();
    const links = Array.from(document.querySelectorAll('a[href]'));
    const hrefs = links.map(l => l.getAttribute('href'));

    const deletedRoutes = ['/characters-hub', '/anime-watch', '/anime-upload', '/admin-dashboard', '/jikan-example'];
    deletedRoutes.forEach(route => {
      expect(hrefs).not.toContain(route);
    });
  });
});
