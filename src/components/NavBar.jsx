import { Link } from 'react-router-dom';
import "../css/Navbar.css";

function NavBar() {
    return <nav className="navbar">
        <div className="navbar-logo">
            <Link to="/">GameBacklog</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">
                Home
            </Link>
            <Link to="/favourites" className="nav-link">
                Backlogged
            </Link>
        </div>

    </nav>
}

export default NavBar;