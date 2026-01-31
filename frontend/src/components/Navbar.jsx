import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBus, FaUser, FaTicketAlt, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <FaBus className="brand-icon" />
                    <span className="brand-text">Bus<span className="brand-accent">Ease</span></span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/cancellation" className="nav-link">Cancellation</Link>
                    <Link to="/view-ticket" className="nav-link">View Ticket</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/my-trips" className="nav-link">
                                <FaTicketAlt />
                                <span>My Trips</span>
                            </Link>
                            <div className="user-menu">
                                <div className="user-info">
                                    <FaUser className="user-icon" />
                                    <span>{user?.name?.split(' ')[0]}</span>
                                </div>
                                <button className="logout-btn" onClick={handleLogout}>
                                    <FaSignOutAlt />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
