import './css/App.css';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Favourites from './pages/Favourites';
import NavBar from './components/NavBar';
import { GameProvider } from './contexts/GameContext';

function App() {

  return (
    <>
      <GameProvider>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favourites" element={<Favourites />} />
          </Routes>
        </main>
      </GameProvider>
    </>

  );
}

export default App;