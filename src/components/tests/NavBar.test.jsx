// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import NavBar from '../NavBar';

vi.mock('../../contexts/AuthContext', () => ({
    useAuthContext: vi.fn(),
}));

describe('NavBar', () => {
    let logout;

    beforeEach(() => {
        logout = vi.fn();
        useAuthContext.mockReturnValue({ user: null, logout });
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the main navigation and login links when logged out', () => {
        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'GameBacklog' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Backlogged' })).toHaveAttribute('href', '/favourites');
        expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
        expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
        expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
    });

    it('shows the username and logs out when logged in', async () => {
        const user = userEvent.setup();
        useAuthContext.mockReturnValue({
            user: { username: 'DummyUser' },
            logout,
        });

        render(
            <MemoryRouter>
                <NavBar />
            </MemoryRouter>
        );

        expect(screen.getByText('Hello, DummyUser')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Logout' }));

        expect(logout).toHaveBeenCalledOnce();
    });
});
