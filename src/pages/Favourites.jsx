import "../css/Favourites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";
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
    "Your next adventure awaits!",
    "Remeber to be kind to yourself",
    "No more doomscrolling!"
];
const headerMessage = randomHeaderMessages[Math.floor(Math.random() * randomHeaderMessages.length)];

function Favourites() {
    const { favourites, getGameScore } = useGameContext();
    const { user } = useAuthContext();
    const [sortBy, setSortBy] = useState("dateAdded");
    const [sortDirection, setSortDirection] = useState("desc");

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

    const sortedFavourites = [...favourites]
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

    const handleSortChange = (event) => {
        const nextSortBy = event.target.value;
        setSortBy(nextSortBy);
        setSortDirection(nextSortBy === "dateAdded" || nextSortBy === "score" ? "desc" : "asc");
        /*
         If the user changes the sortBy to "dateAdded" or "score", we want to default to descending order (Newest->Oldest / Highest->Lowest).
         If the user changes the sortBy to "name" or "releaseDate", we want to default to ascending order (A->Z / Oldest->Newest).
         */
    };

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
            <div className="favourites-sort">
                <label htmlFor="favourites-sort-by">Sort by</label>
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
            <div className="games-grid">
                {sortedFavourites.map(
                    ({ game }) => (
                        (
                            <GameCard key={game.id} game={game} />
                        )
                    )
                )}
            </div>
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