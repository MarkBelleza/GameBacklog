// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useGameContext } from '../../contexts/GameContext';
import Favourites from '../Favourites';

vi.mock('../../contexts/GameContext', () => ({
    useGameContext: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
    useAuthContext: () => ({ user: null }),
}));

vi.mock('../../components/GameCard', () => ({
    default: () => null,
}));

vi.mock('../../components/NoticeBox', () => ({
    default: () => null,
}));

describe('Favourites completion indicator', () => {
    afterEach(() => {
        cleanup();
    });

    it('combines playing, finished, and dropped games into the displayed percentage', () => {
        const games = [
            { id: 1, name: 'Finished game' },
            { id: 2, name: 'Dropped game' },
            { id: 3, name: 'Playing game' },
            { id: 4, name: 'Uncategorized game' },
        ];
        const statuses = {
            1: 'Finished',
            2: 'Dropped',
            3: 'Playing',
        };
        useGameContext.mockReturnValue({
            favourites: games,
            getGameScore: vi.fn(),
            getGameStatus: (gameId) => statuses[gameId] ?? null,
        });

        render(<Favourites />);

        expect(screen.getByRole('progressbar', { name: 'Games with a completion status' }))
            .toHaveAttribute('aria-valuenow', '50');
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(document.querySelector('.favourites-progress-finished')).toHaveStyle({ width: '50%' });
        expect(document.querySelector('.favourites-progress-playing')).toHaveStyle({ width: '25%' });
        expect(document.querySelector('.favourites-progress-uncategorized')).toHaveStyle({ width: '25%' });
        expect(document.querySelector('.favourites-progress-finished'))
            .toHaveAttribute('aria-label', 'Finished & Dropped: 2 games (50%)');
        expect(document.querySelector('.favourites-progress-finished'))
            .toHaveAttribute('title', 'Finished & Dropped: 2 games (50%)');
        expect(document.querySelector('.favourites-progress-playing'))
            .toHaveAttribute('aria-label', 'Playing: 1 game (25%)');
        expect(document.querySelector('.favourites-progress-uncategorized'))
            .toHaveAttribute('aria-label', 'Uncategorized: 1 game (25%)');
    });
});
