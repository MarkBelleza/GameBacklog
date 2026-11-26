// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import NoticeBox from './NoticeBox';

describe('NoticeBox', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows its title and message', () => {
        render(
            <NoticeBox
                title="Guest mode"
                message="Your backlog is stored in this browser."
                storageKey="guest-notice"
            />
        );

        expect(screen.getByRole('heading', { name: 'Guest mode' })).toBeInTheDocument();
        expect(screen.getByText('Your backlog is stored in this browser.')).toBeInTheDocument();
    });

    it('dismisses the notice and remembers the dismissal for the session', async () => {
        const user = userEvent.setup();

        render(
            <NoticeBox
                title="Guest mode"
                message="Your backlog is stored in this browser."
                storageKey="guest-notice"
            />
        );

        //should be visible
        expect(screen.getByRole('heading', { name: 'Guest mode' })).toBeInTheDocument();
        expect(screen.getByText('Your backlog is stored in this browser.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Close' }));

        //should no longer visible
        expect(screen.queryByRole('heading', { name: 'Guest mode' })).not.toBeInTheDocument();
        expect(sessionStorage.getItem('guest-notice')).toBe('dismissed');
    });

    it('stays hidden if it was already dismissed in this session', () => {
        sessionStorage.setItem('guest-notice', 'dismissed');

        render(
            <NoticeBox
                title="Guest mode"
                message="Your backlog is stored in this browser."
                storageKey="guest-notice"
            />
        );

        expect(screen.queryByRole('heading', { name: 'Guest mode' })).not.toBeInTheDocument();
    });
});
