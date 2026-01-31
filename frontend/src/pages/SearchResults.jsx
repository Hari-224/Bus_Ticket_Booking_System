import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaBus, FaMapMarkerAlt, FaClock, FaWifi, FaSnowflake, FaToilet, FaPlug, FaUser, FaStar, FaArrowRight } from 'react-icons/fa';
import { searchService } from '../services/busService';
import toast from 'react-hot-toast';
import './SearchResults.css';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const source = searchParams.get('source') || '';
    const destination = searchParams.get('destination') || '';
    const date = searchParams.get('date') || '';

    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        busType: 'all',
        priceRange: 'all',
    });

    useEffect(() => {
        if (source && destination && date) {
            fetchBuses();
        } else {
            navigate('/');
        }
    }, [source, destination, date]);

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const response = await searchService.searchBuses(source, destination, date);
            if (response.success) {
                setBuses(response.data.buses || []);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to search buses';
            toast.error(message);
            setBuses([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDuration = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    const getBusTypeLabel = (type) => {
        return type.replace(/_/g, ' ');
    };

    const getAmenityIcon = (amenity) => {
        switch (amenity.toLowerCase()) {
            case 'wifi': return <FaWifi />;
            case 'ac': return <FaSnowflake />;
            case 'toilet': return <FaToilet />;
            case 'charging point': return <FaPlug />;
            default: return null;
        }
    };

    const filteredBuses = buses.filter(bus => {
        if (filters.busType !== 'all' && bus.busType !== filters.busType) return false;
        if (filters.priceRange === 'low' && bus.fare > 500) return false;
        if (filters.priceRange === 'mid' && (bus.fare <= 500 || bus.fare > 1000)) return false;
        if (filters.priceRange === 'high' && bus.fare <= 1000) return false;
        return true;
    });

    const handleSelectBus = (scheduleId) => {
        navigate(`/seats/${scheduleId}`);
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Searching for buses...</p>
            </div>
        );
    }

    return (
        <div className="search-results-page page-container">
            <div className="container">
                {/* Search Summary */}
                <div className="search-summary card-glass animate-fadeIn">
                    <div className="route-info">
                        <span className="city">{source}</span>
                        <FaArrowRight className="arrow-icon" />
                        <span className="city">{destination}</span>
                    </div>
                    <div className="date-info">
                        <FaClock />
                        <span>{formatDate(date)}</span>
                    </div>
                    <div className="bus-count">
                        <FaBus />
                        <span>{filteredBuses.length} buses found</span>
                    </div>
                </div>

                <div className="results-layout">
                    {/* Filters */}
                    <aside className="filters-sidebar card animate-slideUp">
                        <h3>Filters</h3>

                        <div className="filter-group">
                            <label className="filter-label">Bus Type</label>
                            <select
                                className="form-input form-select"
                                value={filters.busType}
                                onChange={(e) => setFilters({ ...filters, busType: e.target.value })}
                            >
                                <option value="all">All Types</option>
                                <option value="VOLVO_AC">Volvo AC</option>
                                <option value="AC_SLEEPER">AC Sleeper</option>
                                <option value="AC_SEATER">AC Seater</option>
                                <option value="SLEEPER">Sleeper</option>
                                <option value="SEMI_SLEEPER">Semi Sleeper</option>
                                <option value="SEATER">Seater</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Price Range</label>
                            <select
                                className="form-input form-select"
                                value={filters.priceRange}
                                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                            >
                                <option value="all">All Prices</option>
                                <option value="low">Under ₹500</option>
                                <option value="mid">₹500 - ₹1000</option>
                                <option value="high">Above ₹1000</option>
                            </select>
                        </div>
                    </aside>

                    {/* Bus List */}
                    <div className="bus-list">
                        {filteredBuses.length === 0 ? (
                            <div className="no-results card">
                                <FaBus style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                                <h3>No buses found</h3>
                                <p>Try changing your search filters or select a different date.</p>
                            </div>
                        ) : (
                            filteredBuses.map((bus, index) => (
                                <div
                                    key={bus.scheduleId}
                                    className="bus-card card animate-slideUp"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="bus-header">
                                        <div className="bus-info">
                                            <h3 className="bus-name">{bus.busName}</h3>
                                            <span className="operator-name">{bus.operatorName}</span>
                                        </div>
                                        <div className="bus-type-badge badge badge-primary">
                                            {getBusTypeLabel(bus.busType)}
                                        </div>
                                    </div>

                                    <div className="bus-body">
                                        <div className="journey-times">
                                            <div className="time-block">
                                                <span className="time">{formatTime(bus.departureTime)}</span>
                                                <span className="city-label">{source}</span>
                                            </div>
                                            <div className="duration-block">
                                                <span className="duration-line"></span>
                                                <span className="duration">{formatDuration(bus.durationHours)}</span>
                                                <span className="duration-line"></span>
                                            </div>
                                            <div className="time-block">
                                                <span className="time">{formatTime(bus.arrivalTime)}</span>
                                                <span className="city-label">{destination}</span>
                                            </div>
                                        </div>

                                        <div className="bus-details">
                                            <div className="amenities">
                                                {bus.amenities?.map((amenity, i) => (
                                                    <span key={i} className="amenity-chip" title={amenity}>
                                                        {getAmenityIcon(amenity)}
                                                        <span>{amenity}</span>
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="driver-info">
                                                <FaUser />
                                                <span>{bus.driver?.name}</span>
                                                <span className="experience">{bus.driver?.experienceYears}+ yrs exp</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bus-footer">
                                        <div className="seats-info">
                                            <span className={`seats-count ${bus.availableSeats < 10 ? 'low' : ''}`}>
                                                {bus.availableSeats} seats available
                                            </span>
                                        </div>
                                        <div className="price-block">
                                            <span className="price">₹{Math.round(bus.fare)}</span>
                                            <span className="per-seat">per seat</span>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleSelectBus(bus.scheduleId)}
                                            disabled={bus.availableSeats === 0}
                                        >
                                            {bus.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
