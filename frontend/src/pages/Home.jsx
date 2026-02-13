import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaShieldAlt, FaClock, FaHeadset, FaWifi, FaSnowflake, FaChair } from 'react-icons/fa';
import { routeService } from '../services/busService';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState({ sources: [], destinations: [] });
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutes();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await routeService.getAllRoutes();
            if (response.success) {
                setRoutes(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        if (!source || !destination || !date) {
            toast.error('Please fill in all fields');
            return;
        }

        if (source === destination) {
            toast.error('Source and destination cannot be the same');
            return;
        }

        navigate(`/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${date}`);
    };

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 6);
        return maxDate.toISOString().split('T')[0];
    };

    const features = [
        { icon: <FaShieldAlt />, title: 'Safe & Secure', description: 'Your transactions are protected with bank-grade security' },
        { icon: <FaClock />, title: 'Instant Booking', description: 'Get your tickets confirmed in seconds' },
        { icon: <FaHeadset />, title: '24/7 Support', description: 'Our support team is always here to help' },
    ];

    const amenities = [
        { icon: <FaWifi />, name: 'Free WiFi' },
        { icon: <FaSnowflake />, name: 'AC Buses' },
        { icon: <FaChair />, name: 'Comfortable Seats' },
        { icon: <FaBus />, name: 'GPS Tracking' },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>

                <div className="hero-content container">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Travel Made <span className="text-gradient">Simple</span>
                        </h1>
                        <p className="hero-subtitle">
                            Book bus tickets instantly. Discover comfortable journeys across 500+ routes with top-rated operators.
                        </p>
                    </div>

                    {/* Search Form */}
                    <form className="search-form card-glass" onSubmit={handleSearch}>
                        <div className="search-fields">
                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" />
                                    From
                                </label>
                                <select
                                    className="form-input form-select"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select Source</option>
                                    {routes.sources?.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="swap-icon-container">
                                <div className="swap-icon">⇄</div>
                            </div>

                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" />
                                    To
                                </label>
                                <select
                                    className="form-input form-select"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select Destination</option>
                                    {routes.destinations?.filter(city => city !== source).map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg search-btn">
                                <FaSearch />
                                <span>Search Buses</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section container">
                <h2 className="section-title text-center">Why Choose <span className="text-gradient">BusEase</span></h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card card animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Amenities Section */}
            <section className="amenities-section">
                <div className="container">
                    <h2 className="section-title text-center">Premium <span className="text-gradient">Amenities</span></h2>
                    <div className="amenities-grid">
                        {amenities.map((amenity, index) => (
                            <div key={index} className="amenity-item">
                                <div className="amenity-icon">{amenity.icon}</div>
                                <span>{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section container">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value text-gradient">500+</span>
                        <span className="stat-label">Routes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-gradient">50K+</span>
                        <span className="stat-label">Happy Travelers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-gradient">100+</span>
                        <span className="stat-label">Bus Operators</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-gradient">4.8★</span>
                        <span className="stat-label">User Rating</span>
                    </div>
                </div>
            </section>
        </div>
    );
};
export default Home;
