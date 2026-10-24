import { Link } from 'react-router-dom';
import "../css/Navbar.css";
import { useAuthContext } from '../contexts/AuthContext';

function NavBar() {
    const { user, logout } = useAuthContext();

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

            {user ? (
                <>
                    <span className="nav-user">
                        Hello, {user.username}
                    </span>

                    <button className="nav-link logout-button"
                        onClick={logout}>
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login" className="nav-link">
                        Login
                    </Link>

                    <Link to="/register" className="nav-link">
                        Register
                    </Link>
                </>
            )}
        </div>

    </nav>
}

export default NavBar;