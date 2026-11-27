import GameCard from "../components/GameCard";
import GameViewToggle from "../components/GameViewToggle";
import useGameView from "../hooks/useGameView";
import { useState, useEffect } from "react";
import { getPopularGames, searchGames } from "../services/api";
import "../css/Home.css";

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [games, setGames] = useState([]);
    const [gameView, setGameView] = useGameView();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    // Set up useEffect to fetch popular games when the component mounts
    // This is so you are not fetching everytime the page re-renders when useState is called. This will only run once when the component mounts.
    useEffect(() => {
        const loadPopularGames = async () => {
            try {
                const popularGames = await getPopularGames();
                setGames(popularGames);
            } catch (error) {
                console.log(error);
                setError("Failed to fetch popular games. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        loadPopularGames();
    }, []);

    const handleSearch = async (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            alert("Please enter a search query.");
            return;
        }
        if (loading) return; // Prevent multiple searches while loading
        setLoading(true); //After the user clicks the search button, set loading to true so that the user knows that the search is being processed. This will also prevent multiple searches while loading.
        try {
            const searchResults = await searchGames(searchQuery);
            setGames(searchResults);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.log(error);
            setError("Failed to fetch search results. Please try again later.");
        } finally {
            setLoading(false);
        }

    }

    return <div className="home">
        <h1 className="home-title">Welcome to your Game Backlog</h1>

        <form onSubmit={handleSearch} className="search-form">
            <input
                type="text"
                placeholder="Search games..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-game-btn">
                Search Game
            </button>
        </form>


        {/* Display the list of games */}
        <GameViewToggle
            view={gameView}
            onChange={setGameView}
            className="home-view-toggle"
        />
        <div className={`games-grid${gameView === "list" ? " games-list-view" : ""}`}>
            {games.map(
                (game) => (
                    (
                        <GameCard key={game.id} game={game} layout={gameView} />
                    )
                )
            )}
        </div>
        {loading && <p>Loading games...</p>}
        {error && <p>{error}</p>}
    </div>
}

export default Home;