import "../css/GameCard.css";
import { useGameContext } from "../contexts/GameContext";
import { useState } from "react";

function GameCard({ game }) {
    const { isFavourite, addFavourite, removeFavourite, getGamePlatform, updateGamePlatform, getGameStatus, toggleGameStatus, getGameNote, updateGameNote, saveGameNote, getGameScore, updateGameScore } = useGameContext()
    const favouriteStatus = isFavourite(game.id);
    const gameStatus = getGameStatus(game.id);
    const gameNote = getGameNote(game.id);
    const gameScore = getGameScore(game.id);
    const gamePlatform = getGamePlatform(game.id);
    const [isScoreMenuOpen, setIsScoreMenuOpen] = useState(false);

    function handleFavouriteClick(e) {
        e.preventDefault();
        if (favouriteStatus) {
            removeFavourite(game.id);
        } else {
            addFavourite(game);
        }
    }

    function handleStatusClick(e) {
        e.preventDefault();
        toggleGameStatus(game.id, e.currentTarget.dataset.status);
    }

    function handleScoreSubmit(e) {
        e.preventDefault();
        const score = Number(e.currentTarget.elements.score.value);

        if (score >= 1 && score <= 10) {
            updateGameScore(game.id, e.currentTarget.elements.score.value);
            setIsScoreMenuOpen(false);
        }
    }

    return <div className="game-card">
        <div className="game-poster">
            <img src={game.background_image} alt={game.name} />
            <div className={`game-overlay ${gameStatus ? 'status-selected' : ''}`}>
                <button className={`favourite-btn ${favouriteStatus ? 'active' : ''}`} onClick={handleFavouriteClick}>
                    ♥
                </button>
                {
                    favouriteStatus && (
                        <div className="favourite-status-buttons">
                            {['Playing', 'Finished', 'Dropped'].map((status) => (
                                <button
                                    key={status}
                                    className={`status-btn status-${status.toLowerCase()} ${gameStatus === status ? 'active' : ''}`}
                                    data-status={status}
                                    onClick={handleStatusClick}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
        <div className="game-info">
            <h3>{game.name}</h3>
            <p>{game.released}</p>
            {favouriteStatus && (
                <div className="game-platform">

                    <select
                        id={`platform-${game.id}`}
                        className={
                            gamePlatform
                                ? `platform-${gamePlatform.toLowerCase().replace(/\s+/g, '-')}`
                                : ''
                        }
                        value={gamePlatform}
                        onChange={(e) =>
                            updateGamePlatform(game.id, e.target.value)
                        }
                    >
                        <option value="">Platform</option>
                        <option value="Steam">Steam</option>
                        <option value="Epic Games">Epic Games</option>
                        <option value="GOG">GOG</option>
                        <option value="PlayStation">PlayStation</option>
                        <option value="Xbox">Xbox</option>
                        <option value="Nintendo">Nintendo</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            )}
            {favouriteStatus && (
                <>
                    <div className="game-score">
                        <button
                            type="button"
                            className="score-btn"
                            onClick={() => setIsScoreMenuOpen((isOpen) => !isOpen)}
                            aria-expanded={isScoreMenuOpen}
                            aria-controls={`score-menu-${game.id}`}
                        >
                            {gameScore ? `Score: ${gameScore}` : 'Score:'}
                        </button>
                        {isScoreMenuOpen && (
                            <form id={`score-menu-${game.id}`} className="score-menu" onSubmit={handleScoreSubmit}>
                                <div className="score-search">
                                    <input
                                        name="score"
                                        type="text"
                                        inputMode="decimal"
                                        defaultValue={gameScore}
                                        placeholder="Vote (1.0 - 10.0)"
                                        aria-label={`Score for ${game.name}`}
                                        autoFocus
                                    />
                                    <button type="submit" aria-label="Save score">&#10003;</button>
                                </div>
                                <ul>
                                    {[
                                        [10, 'masterpiece'],
                                        [9, 'excellent'],
                                        [8, 'very good'],
                                        [7, 'good'],
                                        [6, 'decent'],
                                        [5, 'so-so'],
                                        [4, 'weak'],
                                        [3, 'bad'],
                                        [2, 'awful'],
                                        [1, 'worst ever'],
                                    ].map(([score, description]) => (
                                        <li key={score} className={String(gameScore) === String(score) ? 'active' : ''}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateGameScore(game.id, String(score));
                                                    setIsScoreMenuOpen(false);
                                                }}
                                            >
                                                <span>» </span>{score} ({description})
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </form>
                        )}
                    </div>
                    <textarea
                        className="game-note"
                        value={gameNote}
                        onChange={(e) => updateGameNote(game.id, e.target.value)}
                        onBlur={() => saveGameNote(game.id, gameNote)}
                        placeholder="Add a note..."
                        aria-label={`Notes for ${game.name}`}
                        rows="3"
                    />
                </>
            )}
        </div>
    </div>
}

export default GameCard;

