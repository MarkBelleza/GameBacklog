import "../css/Favourites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";

function Favourites() {
    const { favourites } = useGameContext();

    if (favourites.length > 0) {
        {/* Display the list of favourite games */ }
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