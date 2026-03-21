import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBus, FaUser, FaTicketAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand */}
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <FaBus className="brand-icon" />
                    <span className="brand-text">Bus<span className="brand-accent">Ease</span></span>
                </Link>

                {/* Mobile menu toggle */}
                <button
                    className="navbar-toggle"
                    type="button"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Navigation links */}
                <div className={`navbar-links ${isMenuOpen ? 'is-open' : ''}`}>
                    <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                    <Link to="/cancellation" className="nav-link" onClick={closeMenu}>Cancellation</Link>
                    <Link to="/view-ticket" className="nav-link" onClick={closeMenu}>View Ticket</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/my-trips" className="nav-link" onClick={closeMenu}>
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
                            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
