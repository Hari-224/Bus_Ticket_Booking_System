import { Link } from 'react-router-dom';
import { FaBus, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    {/* About Section */}
                    <div className="footer-section">
                        <div className="footer-brand">
                            <FaBus className="footer-brand-icon" />
                            <span className="footer-brand-text">Bus<span className="brand-accent">Ease</span></span>
                        </div>
                        <p className="footer-description">
                            Your trusted partner for comfortable and reliable bus travel. 
                            Book your tickets online and enjoy hassle-free journeys across the country.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <FaFacebook />
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <FaLinkedin />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h3 className="footer-heading">Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/search">Search Buses</Link></li>
                            <li><Link to="/my-trips">My Trips</Link></li>
                            <li><Link to="/view-ticket">View Ticket</Link></li>
                            <li><Link to="/cancellation">Cancel Ticket</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-section">
                        <h3 className="footer-heading">Support</h3>
                        <ul className="footer-links">
                            <li><Link to="#">Help Center</Link></li>
                            <li><Link to="#">FAQs</Link></li>
                            <li><Link to="#">Terms & Conditions</Link></li>
                            <li><Link to="#">Privacy Policy</Link></li>
                            <li><Link to="#">Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h3 className="footer-heading">Contact Us</h3>
                        <ul className="footer-contact">
                            <li>
                                <FaPhone className="contact-icon" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li>
                                <FaEnvelope className="contact-icon" />
                                <span>support@busease.com</span>
                            </li>
                            <li>
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>123 Transport Street, City, State 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} BusEase. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
