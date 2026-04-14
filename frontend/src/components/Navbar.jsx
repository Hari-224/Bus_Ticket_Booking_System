import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBan, FaBars, FaBus, FaSignOutAlt, FaTicketAlt, FaTimes, FaUser } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        onScroll();
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
        <nav className={`navbar ${isScrolled ? 'is-scrolled' : ''}`}>
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
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Home</NavLink>
                    <NavLink to="/cancellation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        <FaBan />
                        <span>Cancellation</span>
                    </NavLink>
                    <NavLink to="/view-ticket" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>
                        <FaTicketAlt />
                        <span>View Ticket</span>
                    </NavLink>
                    <NavLink to="/my-trips" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>My Trips</NavLink>
                    {isAuthenticated ? (
                        <>
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
                            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMenu}>Login</NavLink>
                            <Link to="/register" className="btn btn-primary btn-sm nav-register" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
