import "../css/Favourites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";
import { useAuthContext } from "../contexts/AuthContext";

function Favourites() {
    const { favourites } = useGameContext();
    const { user } = useAuthContext();

    if (!user) {
        return <div className="favourites-empty">
            <h2>Favourites</h2>
            <p>Please log in to view your favourite games.</p>
        </div>
    }

    if (favourites.length > 0) {
        return <div>
            <h2>Favourites</h2>
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
        <h2>Favourites</h2>
        <p>Click the ♥ icon on any game to add it here!</p>
    </div>
}

export default Favourites;