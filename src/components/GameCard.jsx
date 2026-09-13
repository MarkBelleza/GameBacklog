import "../css/GameCard.css";
import { useGameContext } from "../contexts/GameContext";

function GameCard({ game }) {
    const { isFavourite, addFavourite, removeFavourite } = useGameContext()
    const favouriteStatus = isFavourite(game.id);

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

    function handlePlayingClick(e) {
        e.preventDefault();
        console.log("Playing button clicked for game:", game.name);
        // Implement your logic for handling the playing button click here
    }

    return <div className="game-card">
        <div className="game-poster">
            <img src={game.background_image} alt={game.name} />
            <div className="game-overlay">
                <button className={`favourite-btn ${favouriteStatus ? 'active' : ''}`} onClick={handleFavouriteClick}>
                    ♥
                </button>
                {
                    favouriteStatus && (
                        <button className="icon-list-l1" onClick={handlePlayingClick}>
                            <abbr title="Playing" ></abbr>
                        </button>
                    )
                }
            </div>
        </div>
        <div className="game-info">
            <h3>{game.name}</h3>
            {/* <p>{game.description}</p> */}
            <p>{game.released}</p>
        </div>
    </div>
}

export default GameCard;