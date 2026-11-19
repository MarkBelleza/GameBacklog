import { Link, NavLink } from 'react-router-dom';
import "../css/Navbar.css";
import { useAuthContext } from '../contexts/AuthContext';

function NavBar() {
    const { user, logout } = useAuthContext();

    return <nav className="navbar">
        <div className="navbar-logo">
            <Link to="/">GameBacklog</Link>
        </div>
        <div className="navbar-links">
            <NavLink to="/" end className="nav-link">
                Home
            </NavLink>
            <NavLink to="/favourites" className="nav-link">
                Backlogged
            </NavLink>

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
                    <NavLink to="/login" className="nav-link">
                        Login
                    </NavLink>

                    <NavLink to="/register" className="nav-link">
                        Register
                    </NavLink>
                </>
            )}
        </div>

    </nav>
}

export default NavBar;