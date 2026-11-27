import { useEffect, useState } from "react";

const STORAGE_KEY = "gameView";

//Saves the gamecard view mode preference of user
function useGameView() {
    const [view, setView] = useState(() => (
        localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "card"
    ));

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, view);
    }, [view]);

    return [view, setView];
}

export default useGameView;
