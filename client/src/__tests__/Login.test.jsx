// src/__tests__/Login.test.jsx — Login Page Unit Tests
// Tests that the login form renders correctly with all required fields,
// displays validation errors, and includes navigation to the register page.
//
// Vitest test API: https://vitest.dev/api/
// React Testing Library render: https://testing-library.com/docs/react-testing-library/api#render
// React Testing Library screen: https://testing-library.com/docs/queries/about#screen
// React Testing Library fireEvent: https://testing-library.com/docs/dom-testing-library/api-events
// Testing Library queries: https://testing-library.com/docs/queries/bylabeltext
// MemoryRouter for testing: https://reactrouter.com/en/main/router-components/memory-router

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  it('renders the email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('shows an error when submitting an empty form', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Should display a validation error
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('contains a link to the register page', () => {
    renderLogin();
    const registerLink = screen.getByText(/create one here/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
