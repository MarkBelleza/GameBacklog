import "../css/GameCard.css";
import { useGameContext } from "../contexts/GameContext";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

function GameCard({ game }) {
    const { isFavourite, addFavourite, removeFavourite, getGamePlatform, updateGamePlatform, getGameStatus, toggleGameStatus, getGameNote, updateGameNote, saveGameNote, getGameScore, updateGameScore } = useGameContext()
    const favouriteStatus = isFavourite(game.id);
    const gameStatus = getGameStatus(game.id);
    const gameNote = getGameNote(game.id);
    const notePreview = gameNote.trim().replace(/\s+/g, " ");
    const noteButtonText = notePreview
        ? `${notePreview.slice(0, 36)}${notePreview.length > 36 ? "…" : ""}`
        : "Add note";
    const gameScore = getGameScore(game.id);
    const gamePlatform = getGamePlatform(game.id);
    const [isScoreMenuOpen, setIsScoreMenuOpen] = useState(false);
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");
    const [noteSaveError, setNoteSaveError] = useState("");
    const [isNoteSaving, setIsNoteSaving] = useState(false);
    const noteButtonRef = useRef(null);

    function openNoteEditor() {
        setNoteDraft(gameNote);
        setNoteSaveError("");
        setIsNoteEditorOpen(true);
    }

    function closeNoteEditor() {
        setIsNoteEditorOpen(false);
        noteButtonRef.current?.focus();
    }

    async function handleNoteSave(event) {
        event.preventDefault();
        setIsNoteSaving(true);
        setNoteSaveError("");

        try {
            await saveGameNote(game.id, noteDraft);
            updateGameNote(game.id, noteDraft);
            closeNoteEditor();
        } catch {
            setNoteSaveError("Failed to save note. Please try again.");
        } finally {
            setIsNoteSaving(false);
        }
    }

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
        const scoreValue = e.currentTarget.elements.score.value;

        if (scoreValue === "") {
            updateGameScore(game.id, "");
            setIsScoreMenuOpen(false);
            return;
        }

        const score = Number(scoreValue);
        if (score >= 1 && score <= 10) {
            updateGameScore(game.id, scoreValue);
            setIsScoreMenuOpen(false);
        }
    }

    return <>
        <div className="game-card">
            <div className="game-poster">
                <img
                    src={game.cover?.url
                        ? (game.cover.url.startsWith('//')
                            ? `https:${game.cover.url.replace('t_thumb', 't_1080p')}`
                            : game.cover.url.replace('t_thumb', 't_1080p'))
                        : '/placeholder.png'
                    }
                    alt={game.name}
                />
                <div className="game-overlay">
                    <button className={`favourite-btn ${favouriteStatus ? 'active' : ''}`} onClick={handleFavouriteClick}>
                        ♥
                    </button>
                </div>
            </div>
            {favouriteStatus && (
                <div className={`favourite-status-buttons${gameStatus ? " status-selected" : ""}`}>
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
            )}
            <div className="game-info">
                <h3>{game.name}</h3>
                <p>
                    {game.first_release_date
                        ? new Date(game.first_release_date * 1000).toLocaleDateString()
                        : 'Release date unknown'}
                </p>
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
                        <button
                            ref={noteButtonRef}
                            type="button"
                            className={`game-note-button${notePreview ? " has-note-preview" : ""}`}
                            aria-label={`${gameNote ? "View or edit" : "Add"} note for ${game.name}`}
                            aria-haspopup="dialog"
                            aria-expanded={isNoteEditorOpen}
                            aria-controls={`game-note-dialog-${game.id}`}
                            onClick={openNoteEditor}
                        >
                            {noteButtonText}
                        </button>
                    </>
                )}
            </div>
        </div>
        {isNoteEditorOpen && createPortal(
            <div
                className="game-note-backdrop"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeNoteEditor();
                }}
                onKeyDown={(event) => {
                    if (event.key === "Escape") closeNoteEditor();
                }}
            >
                <section
                    id={`game-note-dialog-${game.id}`}
                    className="game-note-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`game-note-title-${game.id}`}
                >
                    <h2 id={`game-note-title-${game.id}`}>Notes for "{game.name}"</h2>
                    <form onSubmit={handleNoteSave}>
                        <textarea
                            className="game-note"
                            value={noteDraft}
                            onChange={(event) => setNoteDraft(event.target.value)}
                            placeholder="Add a note..."
                            aria-label={`Notes for ${game.name}`}
                            rows="6"
                            autoFocus
                        />
                        {noteSaveError && (
                            <p className="game-note-error" role="alert">{noteSaveError}</p>
                        )}
                        <div className="game-note-actions">
                            <button
                                type="button"
                                className="game-note-cancel"
                                onClick={closeNoteEditor}
                                disabled={isNoteSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="game-note-save"
                                disabled={isNoteSaving}
                            >
                                {isNoteSaving ? "Saving..." : "Save note"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>,
            document.body
        )}
    </>
}

export default GameCard;

