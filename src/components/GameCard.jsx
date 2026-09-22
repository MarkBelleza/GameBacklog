import "../css/GameCard.css";
import { useGameContext } from "../contexts/GameContext";
import { useState } from "react";

function GameCard({ game }) {
    const { isFavourite, addFavourite, removeFavourite, getGameStatus, toggleGameStatus, getGameNote, updateGameNote, getGameScore, updateGameScore } = useGameContext()
    const favouriteStatus = isFavourite(game.id);
    const gameStatus = getGameStatus(game.id);
    const gameNote = getGameNote(game.id);
    const gameScore = getGameScore(game.id);
    const [isScoreMenuOpen, setIsScoreMenuOpen] = useState(false);

    function handleFavouriteClick(e) {
        e.preventDefault();
        if (favouriteStatus) {
            removeFavourite(game.id);
            console.log(favouriteStatus)
        } else {
            addFavourite(game);
            console.log(favouriteStatus)
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
            {/* <p>{game.description}</p> */}
            <p>{game.released}</p>
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
                            {gameScore ? `Score: ${gameScore}` : 'Score'}
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

