import "../css/Favourites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";
import GameViewToggle from "../components/GameViewToggle";
import useGameView from "../hooks/useGameView";
import { useAuthContext } from "../contexts/AuthContext";
import NoticeBox from "../components/NoticeBox";
import "../css/NoticeBox.css";
import { useState } from "react";

const randomHeaderMessages = [
    "Hmm.. What's next?",
    "Your Games awaits!",
    "Time to play!",
    "Your backlog is calling!",
    "Ready to play?",
    "Remember to take breaks",
    "Don't forget to hydrate",
    "Game on!",
    "Next adventure awaits!",
    "Be kind to yourself",
    "No more doomscrolling!",
    "Next?"
];
const headerMessage = randomHeaderMessages[Math.floor(Math.random() * randomHeaderMessages.length)];
const statusFilters = ["Playing", "Finished", "Dropped", "Uncategorized"];

function Favourites() {
    const { favourites, getGameScore, getGameStatus } = useGameContext();
    const { user } = useAuthContext();
    const [sortBy, setSortBy] = useState("dateAdded");
    const [sortDirection, setSortDirection] = useState("desc");
    const [gameView, setGameView] = useGameView();
    const [selectedStatuses, setSelectedStatuses] = useState(statusFilters);
    const [searchQuery, setSearchQuery] = useState("");

    const statusCounts = favourites.reduce((counts, game) => {
        const status = getGameStatus(game.id);

        if (status === "Finished" || status === "Dropped") {
            counts.finishedOrDropped += 1;
        } else if (status === "Playing") {
            counts.playing += 1;
        } else {
            counts.uncategorized += 1;
        }

        return counts;
    }, { finishedOrDropped: 0, playing: 0, uncategorized: 0 });
    const completionPercentage = Math.round(
        ((statusCounts.finishedOrDropped) / favourites.length) * 100
    );
    const formatProgressDetails = (label, count) => {
        const percentage = Math.round((count / favourites.length) * 100);
        const gameLabel = count === 1 ? "game" : "games";
        return `${label}: ${count} ${gameLabel} (${percentage}%)`;
    };
    const finishedDetails = formatProgressDetails("Finished & Dropped", statusCounts.finishedOrDropped);
    const playingDetails = formatProgressDetails("Playing", statusCounts.playing);
    const uncategorizedDetails = formatProgressDetails("Uncategorized", statusCounts.uncategorized);

    const getSortValue = (game) => {
        switch (sortBy) {
            case "name":
                return game.name?.toLocaleLowerCase() ?? null;
            case "releaseDate":
                if (!game.first_release_date) return null;
                return Number.isFinite(game.first_release_date)
                    ? game.first_release_date * 1000
                    : null;
            case "dateAdded": {
                const dateAdded = game.dateAdded
                    ? new Date(game.dateAdded).getTime()
                    : null;
                return Number.isFinite(dateAdded) ? dateAdded : null;
            }
            case "score": {
                const score = getGameScore(game.id);
                const numericScore = Number(score);
                return score === "" || !Number.isFinite(numericScore)
                    ? null
                    : numericScore;
            }
            default:
                return null;
        }
    };

    const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
    const filteredFavourites = favourites.filter((game) => {
        const status = getGameStatus(game.id) || "Uncategorized";
        const matchesStatus = selectedStatuses.includes(status);
        const matchesSearch = (game.name ?? "").toLocaleLowerCase().includes(normalizedSearchQuery);
        return matchesStatus && matchesSearch;
    });

    const sortedFavourites = [...filteredFavourites]
        .map((game, index) => ({ game, index, value: getSortValue(game) }))
        .sort((left, right) => {
            if (left.value === null && right.value !== null) return 1;
            if (left.value !== null && right.value === null) return -1;
            if (left.value === null && right.value === null) {
                return left.index - right.index;
            }

            const comparison = typeof left.value === "string"
                ? left.value.localeCompare(right.value)
                : left.value - right.value;

            return (sortDirection === "asc" ? comparison : -comparison)
                || left.index - right.index;
        });

    const handleStatusFilterChange = (status) => {
        setSelectedStatuses((currentStatuses) => (
            currentStatuses.includes(status)
                ? currentStatuses.filter((currentStatus) => currentStatus !== status)
                : [...currentStatuses, status]
        ));
    };

    const handleAllFilterChange = () => {
        setSelectedStatuses((currentStatuses) => (
            currentStatuses.length === statusFilters.length ? [] : statusFilters
        ));
    };

    const handleSortChange = (event) => {
        const nextSortBy = event.target.value;
        setSortBy(nextSortBy);
        setSortDirection(nextSortBy === "dateAdded" || nextSortBy === "score" ? "desc" : "asc");
        /*
         If the user changes the sortBy to "dateAdded" or "score", we want to default to descending order (Newest->Oldest / Highest->Lowest).
         If the user changes the sortBy to "name" or "releaseDate", we want to default to ascending order (A->Z / Oldest->Newest).
         */
    };

    const handleSearch = (event) => {
        event.preventDefault();
    }

    if (favourites.length > 0) {
        const directionLabel = sortBy === "dateAdded"
            ? (sortDirection === "desc" ? "Newest first" : "Oldest first")
            : sortBy === "score"
                ? (sortDirection === "desc" ? "Highest first" : "Lowest first")
                : sortBy === "releaseDate"
                    ? (sortDirection === "asc" ? "Oldest first" : "Newest first")
                    : (sortDirection === "asc" ? "A–Z" : "Z–A");

        return <div className="favourites">
            <h2>{headerMessage}</h2>
            <div className="favourites-toolbar">
                <div className="favourites-sort">
                    <fieldset className="favourites-sort-group">
                        <legend>Sort by</legend>
                        <div className="favourites-sort-options">
                            <div className="favourites-sort-select-wrap">
                                <select
                                    id="favourites-sort-by"
                                    value={sortBy}
                                    onChange={handleSortChange}
                                >
                                    <option value="name">Name (title)</option>
                                    <option value="releaseDate">Release date</option>
                                    <option value="dateAdded">Date added</option>
                                    <option value="score">Score</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                className="favourites-sort-direction"
                                onClick={() => setSortDirection((direction) => direction === "asc" ? "desc" : "asc")}
                                aria-label={`Change sort order, currently ${directionLabel}`}
                                title={`Change sort order (${directionLabel})`}
                            >
                                {directionLabel}
                                <span aria-hidden="true">{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                            </button>
                        </div>
                    </fieldset>
                    <fieldset className="favourites-status-filter-group">
                        <legend>Filter</legend>
                        <details className="favourites-status-dropdown">
                            <summary>
                                <span className="favourites-status-selection">
                                    {selectedStatuses.length === statusFilters.length
                                        ? "All statuses"
                                        : selectedStatuses.length === 0
                                            ? "No statuses"
                                            : `${selectedStatuses.length} selected`}
                                </span>
                            </summary>
                            <fieldset className="favourites-status-options">
                                <legend>By status</legend>
                                <label className={selectedStatuses.length === statusFilters.length ? "selected all-status-filter" : ""}>
                                    <input
                                        type="checkbox"
                                        checked={selectedStatuses.length === statusFilters.length}
                                        onChange={handleAllFilterChange}
                                    />
                                    All
                                </label>
                                {statusFilters.map((status) => (
                                    <label
                                        key={status}
                                        className={selectedStatuses.includes(status)
                                            ? `selected status-filter-${status.toLowerCase()}`
                                            : ""}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuses.includes(status)}
                                            onChange={() => handleStatusFilterChange(status)}
                                        />
                                        {status}
                                    </label>
                                ))}
                            </fieldset>
                        </details>
                    </fieldset>
                </div>
                <form onSubmit={handleSearch} className="search-form favourites-search">
                    <input
                        type="text"
                        placeholder="Search games..."
                        className="search-input"
                        aria-label="Search games in your backlog"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
                <fieldset className="favourites-progress">
                    <legend>Completion</legend>
                    <div
                        className="favourites-progress-bar"
                        role="progressbar"
                        aria-label="Games with a completion status"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={completionPercentage}
                        aria-valuetext={`${completionPercentage}% have a completion status. ${finishedDetails}; ${playingDetails}; ${uncategorizedDetails}.`}
                    >
                        <span
                            className="favourites-progress-finished"
                            aria-label={finishedDetails}
                            title={finishedDetails}
                            style={{ width: `${(statusCounts.finishedOrDropped / favourites.length) * 100}%` }}
                        />
                        <span
                            className="favourites-progress-playing"
                            aria-label={playingDetails}
                            title={playingDetails}
                            style={{ width: `${(statusCounts.playing / favourites.length) * 100}%` }}
                        />
                        <span
                            className="favourites-progress-uncategorized"
                            aria-label={uncategorizedDetails}
                            title={uncategorizedDetails}
                            style={{ width: `${(statusCounts.uncategorized / favourites.length) * 100}%` }}
                        />
                    </div>
                    <span className="favourites-progress-percentage">{completionPercentage}%</span>
                </fieldset>
                <GameViewToggle
                    view={gameView}
                    onChange={setGameView}
                    className="favourites-view-toggle"
                />
            </div>
            <div className={`games-grid${gameView === "list" ? " games-list-view" : ""}`}>
                {sortedFavourites.map(({ game }) => (
                    <GameCard key={game.id} game={game} layout={gameView} />
                ))}
            </div>
            {sortedFavourites.length === 0 && (
                <p className="favourites-no-results">
                    {normalizedSearchQuery
                        ? "No backlog games match your search and selected statuses."
                        : "No games match the selected statuses."}
                </p>
            )}
            {!user && (
                <div className="guest-notice-fixed">
                    <NoticeBox
                        title="Guest User Notice"
                        message="As a guest, your backlogged games will only be saved to your browser's local storage. Log in to save your backlogged games to the cloud and access them from any device! Note that currently saved games as guest will not be transferred to your account when you log in."
                        storageKey="guest-notice"
                    />
                </div>
            )}
        </div>
    }

    return <div className="favourites-empty">
        <h2>Backlogged Games</h2>
        <p>Click the ♥ icon on any game to add it here!</p>
    </div>
}

export default Favourites;