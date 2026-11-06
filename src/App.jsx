import './css/App.css';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Favourites from './pages/Favourites';
import NavBar from './components/NavBar';
import Register from './pages/Register';
import Login from './pages/Login';
import NoticeBox from './components/NoticeBox';

function App() {

  return (
    <>
      <NavBar />
      <NoticeBox
        title="Heads up!"
        message="Due to Render's free tier hosting, the backend server may take a few seconds to wake up for first time visitors or after periods of inactivity. It may take a moment for the games to display and for login/register actions to complete. Thank you for your patience!"
        storageKey="render-notice"
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </>

  );
}

export default App;