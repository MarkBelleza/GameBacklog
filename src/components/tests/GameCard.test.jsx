// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameContext } from '../../contexts/GameContext';
import GameCard from '../GameCard';

vi.mock('../../contexts/GameContext', () => ({
    useGameContext: vi.fn(),
}));

describe('GameCard', () => {
    let addFavourite;
    let removeFavourite;
    let updateGamePlatform;
    let toggleGameStatus;
    let updateGameScore;
    let saveGameNote;
    let updateGameNote;
    let gameContext;

    beforeEach(() => {
        addFavourite = vi.fn();
        removeFavourite = vi.fn();
        updateGamePlatform = vi.fn();
        toggleGameStatus = vi.fn();
        updateGameScore = vi.fn();
        saveGameNote = vi.fn().mockResolvedValue(undefined);
        updateGameNote = vi.fn();
        gameContext = {
            isFavourite: vi.fn().mockReturnValue(false),
            addFavourite,
            removeFavourite,
            getGamePlatform: vi.fn().mockReturnValue(''),
            updateGamePlatform,
            getGameStatus: vi.fn().mockReturnValue(null),
            toggleGameStatus,
            getGameNote: vi.fn().mockReturnValue(''),
            updateGameNote,
            saveGameNote,
            getGameScore: vi.fn().mockReturnValue(''),
            updateGameScore,
        };
        useGameContext.mockReturnValue(gameContext);
    });

    afterEach(() => {
        cleanup();
    });

    it('shows the game name, release date, and cover', () => {
        const game = {
            id: 1,
            name: 'Example Game',
            first_release_date: 1704067200,
            cover: { url: '//images.example.com/t_thumb/cover.jpg' },
        };

        render(<GameCard game={game} />);

        expect(screen.getByRole('heading', { name: 'Example Game' })).toBeInTheDocument();
        expect(screen.getByText(new Date(game.first_release_date * 1000).toLocaleDateString())).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Example Game' })).toHaveAttribute(
            'src',
            'https://images.example.com/t_1080p/cover.jpg'
        );
    });

    it('renders list layout with backlog controls and actions', async () => {
        const user = userEvent.setup();
        const game = { id: 21, name: 'List Game' };
        gameContext.isFavourite.mockReturnValue(true);

        render(<GameCard game={game} layout="list" />);

        expect(document.querySelector('.game-list')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'List Game' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Playing' })).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Score:' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add note for List Game' })).toBeInTheDocument();

        //Test the status and platform fields
        await user.click(screen.getByRole('button', { name: 'Playing' }));
        await user.selectOptions(screen.getByRole('combobox'), 'Steam');
        expect(toggleGameStatus).toHaveBeenCalledWith(game.id, 'Playing');
        expect(updateGamePlatform).toHaveBeenCalledWith(game.id, 'Steam');

        //Test the score field
        await user.click(screen.getByRole('button', { name: 'Score:' }));
        await user.type(screen.getByRole('textbox', { name: 'Score for List Game' }), '8');
        await user.click(screen.getByRole('button', { name: 'Save score' }));
        expect(updateGameScore).toHaveBeenCalledWith(game.id, '8');

        //Test the notes field
        await user.click(screen.getByRole('button', { name: 'Add note for List Game' }));
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Notes for List Game' }), 'Play after work');
        await user.click(screen.getByRole('button', { name: 'Save note' }));
        expect(saveGameNote).toHaveBeenCalledWith(game.id, 'Play after work');
        expect(updateGameNote).toHaveBeenCalledWith(game.id, 'Play after work');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows the full note in list view while keeping the card preview to 36 characters', () => {
        const game = { id: 23, name: 'Long Note Game' };
        const note = 'A long note that should be visible in full while browsing the list';
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGameNote.mockReturnValue(note);

        const { rerender } = render(<GameCard game={game} layout="list" />);
        const noteButtonName = `View or edit note for ${game.name}`;

        expect(screen.getByRole('button', { name: noteButtonName })).toHaveTextContent(note);

        rerender(<GameCard game={game} layout="card" />);

        expect(screen.getByRole('button', { name: noteButtonName }))
            .toHaveTextContent(`${note.slice(0, 36)}…`);
    });

    it('uses fallback text and image when game details are missing', () => {
        render(<GameCard game={{ id: 2, name: 'Unknown Game' }} />);

        expect(screen.getByText('Release date unknown')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Unknown Game' })).toHaveAttribute('src', '/placeholder.png');
    });

    it('hides status, platform, score, and notes controls when the game is not a favourite', () => {
        render(<GameCard game={{ id: 10, name: 'Regular Game' }} />);

        expect(screen.queryByRole('button', { name: 'Playing' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Finished' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Dropped' })).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Score:' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add note for Regular Game' })).not.toBeInTheDocument();
    });

    it('adds the game to favourites when the favourite button is clicked', async () => {
        const user = userEvent.setup();
        const game = { id: 3, name: 'Favourite Game' };

        const { rerender } = render(<GameCard game={game} />);
        await user.click(screen.getByRole('button', { name: '♥' }));

        expect(addFavourite).toHaveBeenCalledWith(game);
        gameContext.isFavourite.mockReturnValue(true);

        rerender(<GameCard game={game} />);
        expect(screen.queryByRole('button', { name: 'Playing' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Finished' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Dropped' })).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Score:' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add note for Favourite Game' })).toBeInTheDocument();
    });

    it('removes the game from favourites when it is already a favourite', async () => {
        const user = userEvent.setup();
        const game = { id: 4, name: 'Favourite Game' };
        gameContext.isFavourite.mockReturnValue(true);

        const { rerender } = render(<GameCard game={game} />);
        await user.click(screen.getByRole('button', { name: '♥' }));

        expect(removeFavourite).toHaveBeenCalledWith(game.id);
        gameContext.isFavourite.mockReturnValue(false);

        rerender(<GameCard game={game} />);
        expect(screen.queryByRole('button', { name: 'Playing' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Finished' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Dropped' })).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Score:' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Add note for Favourite Game' })).not.toBeInTheDocument();
    });

    it('displays the selected status for a favourite game', async () => {
        const user = userEvent.setup();
        const game = { id: 5, name: 'Status Game' };
        let selectedStatus = null;
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGameStatus.mockImplementation(() => selectedStatus);
        toggleGameStatus.mockImplementation((_gameId, status) => {
            selectedStatus = selectedStatus === status ? null : status;
        });
        const { rerender } = render(<GameCard game={game} />);

        const playingButton = screen.getByRole('button', { name: 'Playing' });
        await user.click(playingButton);
        expect(toggleGameStatus).toHaveBeenCalledWith(game.id, 'Playing');

        rerender(<GameCard game={game} />);

        expect(playingButton).toHaveClass('active');
    });

    it('removes the selected status when it is clicked again', async () => {
        const user = userEvent.setup();
        const game = { id: 6, name: 'Status Game' };
        let selectedStatus = 'Playing';
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGameStatus.mockImplementation(() => selectedStatus);
        toggleGameStatus.mockImplementation((_gameId, status) => {
            selectedStatus = selectedStatus === status ? null : status;
        });
        const { rerender } = render(<GameCard game={game} />);

        const playingButton = screen.getByRole('button', { name: 'Playing' });
        expect(playingButton).toHaveClass('active');

        await user.click(playingButton);
        expect(toggleGameStatus).toHaveBeenCalledWith(game.id, 'Playing');

        rerender(<GameCard game={game} />);

        expect(playingButton).not.toHaveClass('active');
    });

    it('displays the platform after selecting it', async () => {
        const user = userEvent.setup();
        const game = { id: 8, name: 'Scored Game' };
        let selectedPlatform = '';
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGamePlatform.mockImplementation(() => selectedPlatform);
        updateGamePlatform.mockImplementation((_gameId, platform) => {
            selectedPlatform = platform;
        });
        const { rerender } = render(<GameCard game={game} />);

        const platformSelect = screen.getByRole('combobox');
        await user.selectOptions(platformSelect, 'Steam');
        expect(updateGamePlatform).toHaveBeenCalledWith(game.id, 'Steam');

        rerender(<GameCard game={game} />);

        expect(platformSelect).toHaveValue('Steam');
        expect(platformSelect).toHaveClass('platform-steam');
    });

    it('removes the selected platform when Platform is selected', async () => {
        const user = userEvent.setup();
        const game = { id: 7, name: 'Platform Game' };
        let selectedPlatform = 'Steam';
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGamePlatform.mockImplementation(() => selectedPlatform);
        updateGamePlatform.mockImplementation((_gameId, platform) => {
            selectedPlatform = platform;
        });
        const { rerender } = render(<GameCard game={game} />);

        const platformSelect = screen.getByRole('combobox');
        expect(platformSelect).toHaveValue('Steam');

        await user.selectOptions(platformSelect, '');
        expect(updateGamePlatform).toHaveBeenCalledWith(game.id, '');

        rerender(<GameCard game={game} />);

        expect(platformSelect).toHaveValue('');
        expect(platformSelect).not.toHaveClass('platform-steam');
    });

    it('displays the score after saving it for a favourite game', async () => {
        const user = userEvent.setup();
        const game = { id: 8, name: 'Scored Game' };
        let selectedScore = '';
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGameScore.mockImplementation(() => selectedScore);
        updateGameScore.mockImplementation((_gameId, score) => {
            selectedScore = score;
        });
        const { rerender } = render(<GameCard game={game} />);

        await user.click(screen.getByRole('button', { name: 'Score:' }));
        await user.type(screen.getByRole('textbox', { name: 'Score for Scored Game' }), '8');
        await user.click(screen.getByRole('button', { name: 'Save score' }));
        expect(updateGameScore).toHaveBeenCalledWith(game.id, '8');

        rerender(<GameCard game={game} />);

        expect(screen.getByRole('button', { name: 'Score: 8' })).toBeInTheDocument();
    });

    it('removes the score when an empty score is saved', async () => {
        const user = userEvent.setup();
        const game = { id: 8, name: 'Scored Game' };
        let selectedScore = '8';
        gameContext.isFavourite.mockReturnValue(true);
        gameContext.getGameScore.mockImplementation(() => selectedScore);
        updateGameScore.mockImplementation((_gameId, score) => {
            selectedScore = score;
        });
        const { rerender } = render(<GameCard game={game} />);

        await user.click(screen.getByRole('button', { name: 'Score: 8' }));
        await user.clear(screen.getByRole('textbox', { name: 'Score for Scored Game' }));
        await user.click(screen.getByRole('button', { name: 'Save score' }));
        expect(updateGameScore).toHaveBeenCalledWith(game.id, '');

        rerender(<GameCard game={game} />);

        expect(screen.getByRole('button', { name: 'Score:' })).toBeInTheDocument();
    });

    it('saves an edited note for a favourite game', async () => {
        const user = userEvent.setup();
        const game = { id: 9, name: 'Noted Game' };
        gameContext.isFavourite.mockReturnValue(true);
        render(<GameCard game={game} />);

        await user.click(screen.getByRole('button', { name: 'Add note for Noted Game' }));
        expect(screen.queryByRole('dialog')).toBeInTheDocument();

        await user.type(screen.getByRole('textbox', { name: 'Notes for Noted Game' }), 'Play after work');
        await user.click(screen.getByRole('button', { name: 'Save note' }));

        expect(saveGameNote).toHaveBeenCalledWith(game.id, 'Play after work');
        expect(updateGameNote).toHaveBeenCalledWith(game.id, 'Play after work');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
