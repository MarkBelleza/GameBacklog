import "../css/Favourites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";
import { useAuthContext } from "../contexts/AuthContext";

function Favourites() {
    const { favourites } = useGameContext();
    const { user } = useAuthContext();

    if (!user) {
        return <div className="favourites-empty">
            <h2>Backlogged Games</h2>
            <p>Please log in to view your backlogged games.</p>
        </div>
    }

    if (favourites.length > 0) {
        return <div>
            <h2>Hmm.. What's next?</h2>
            <div className="games-grid">
                {favourites.map(
                    (game) => (
                        (
                            <GameCard key={game.id} game={game} />
                        )
                    )
                )}
            </div>
        </div>
    }

    return <div className="favourites-empty">
        <h2>Backlogged Games</h2>
        <p>Click the ♥ icon on any game to add it here!</p>
    </div>
}

export default Favourites;