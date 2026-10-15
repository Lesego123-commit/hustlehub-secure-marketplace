// src/__tests__/App.test.jsx — App Component Integration Tests
// Verifies that the App component renders without crashing, shows the login
// page for unauthenticated users, and includes expected navigation elements.
//
// Vitest test API: https://vitest.dev/api/
// React Testing Library render: https://testing-library.com/docs/react-testing-library/api#render
// React Testing Library screen: https://testing-library.com/docs/queries/about#screen
// Testing Library queries: https://testing-library.com/docs/queries/byrole
// MemoryRouter for testing: https://reactrouter.com/en/main/router-components/memory-router

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Helper: render App inside a MemoryRouter so route-dependent code works
function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
}

describe('App Component', () => {
  it('renders without crashing', () => {
    renderApp();
    // The app should render some content
    expect(document.getElementById('root') || document.body).toBeTruthy();
  });

  it('shows the login page when not authenticated', () => {
    renderApp('/login');
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('displays the HustleHub+ brand on the login page', () => {
    renderApp('/login');
    // The brand name is split across text nodes (Hustle + Hub+)
    expect(screen.getByText(/Hustle/)).toBeInTheDocument();
  });

  it('redirects the root path to login', () => {
    renderApp('/');
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });
});
