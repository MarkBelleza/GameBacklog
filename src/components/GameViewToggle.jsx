import "../css/GameViewToggle.css";

function GameViewToggle({ view, onChange, className = "" }) {
    return (
        <div className={`game-view-toggle ${className}`} role="group" aria-label="Game display">
            <button
                type="button"
                aria-pressed={view === "card"}
                onClick={() => onChange("card")}
            >
                Card view
            </button>
            <button
                type="button"
                aria-pressed={view === "list"}
                onClick={() => onChange("list")}
            >
                List view
            </button>
        </div>
    );
}

export default GameViewToggle;
