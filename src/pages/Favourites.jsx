import "../css/Favourites.css";
import { useGameContext } from "../contexts/GameContext";
import GameCard from "../components/GameCard";
import { useAuthContext } from "../contexts/AuthContext";
import NoticeBox from "../components/NoticeBox";
import "../css/NoticeBox.css";

function Favourites() {
    const { favourites } = useGameContext();
    const { user } = useAuthContext();


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