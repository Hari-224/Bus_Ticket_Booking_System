import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaBus, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChevronRight, FaSearch, FaFilter } from 'react-icons/fa';
import { bookingService } from '../services/busService';
import toast from 'react-hot-toast';
import './MyTrips.css';

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await bookingService.getMyTrips();
            if (response.success) {
                setTrips(response.data || []);
            }
        } catch (error) {
            toast.error('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusBadge = (status, departureTime) => {
        // Check if trip date has passed
        const tripDate = new Date(departureTime);
        const today = new Date();
        const isExpired = tripDate < today;
        
        // If trip is confirmed but date has passed, show as completed
        if (status === 'CONFIRMED' && isExpired) {
            return <span className="badge badge-success">Completed</span>;
        }
        
        const statusConfig = {
            CONFIRMED: { class: 'badge-success', label: 'Confirmed' },
            PENDING: { class: 'badge-warning', label: 'Pending Payment' },
            CANCELLED: { class: 'badge-error', label: 'Cancelled' },
            EXPIRED: { class: 'badge-error', label: 'Expired' },
        };
        const config = statusConfig[status] || { class: 'badge-primary', label: status };
        return <span className={`badge ${config.class}`}>{config.label}</span>;
    };

    const isUpcoming = (departureTime) => {
        return new Date(departureTime) > new Date();
    };

    const filteredTrips = trips.filter(trip => {
        const upcoming = isUpcoming(trip.journey?.departureTime);
        
        if (filter === 'upcoming') return upcoming && trip.status === 'CONFIRMED';
        if (filter === 'past') return !upcoming && trip.status === 'CONFIRMED';
        if (filter === 'cancelled') return trip.status === 'CANCELLED';
        return true;
    });

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading your trips...</p>
            </div>
        );
    }

    return (
        <div className="my-trips-page page-container">
            <div className="container">
                <div className="page-header">
                    <h1><FaTicketAlt /> My Trips</h1>
                    <p>View and manage your bus bookings</p>
                </div>

                {/* Filters */}
                <div className="trips-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({trips.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </button>
                    <button
                        className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled
                    </button>
                </div>

                {/* Trips List */}
                <div className="trips-list">
                    {filteredTrips.length === 0 ? (
                        <div className="no-trips card">
                            <FaTicketAlt style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h3>No trips found</h3>
                            <p>
                                {filter === 'all'
                                    ? "You haven't booked any trips yet."
                                    : `No ${filter} trips to show.`}
                            </p>
                            <Link to="/" className="btn btn-primary">
                                <FaSearch />
                                <span>Book a Trip</span>
                            </Link>
                        </div>
                    ) : (
                        filteredTrips.map((trip, index) => (
                            <Link
                                to={trip.status === 'PENDING' ? `/payment/${trip.pnr}` : `/ticket/${trip.pnr}`}
                                key={trip.pnr}
                                className="trip-card card animate-slideUp"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="trip-header">
                                    <div className="trip-date">
                                        <FaCalendarAlt />
                                        <span>{formatDate(trip.journey?.departureTime)}</span>
                                    </div>
                                    {getStatusBadge(trip.status, trip.journey?.departureTime)}
                                </div>

                                <div className="trip-body">
                                    <div className="trip-route">
                                        <div className="route-point">
                                            <span className="point-time">{formatTime(trip.journey?.departureTime)}</span>
                                            <span className="point-city">{trip.journey?.source}</span>
                                        </div>
                                        <div className="route-arrow">
                                            <span className="route-line"></span>
                                            <FaBus className="route-icon" />
                                            <span className="route-line"></span>
                                        </div>
                                        <div className="route-point">
                                            <span className="point-time">{formatTime(trip.journey?.arrivalTime)}</span>
                                            <span className="point-city">{trip.journey?.destination}</span>
                                        </div>
                                    </div>

                                    <div className="trip-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Bus</span>
                                            <span className="detail-value">{trip.bus?.busName}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">PNR</span>
                                            <span className="detail-value pnr">{trip.pnr}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Passengers</span>
                                            <span className="detail-value">{trip.totalSeats}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Amount</span>
                                            <span className="detail-value">₹{Math.round(trip.fare?.finalAmount || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="trip-footer">
                                    <span className="view-details">
                                        {trip.status === 'PENDING' ? 'Complete Payment' : 'View Ticket'}
                                        <FaChevronRight />
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTrips;
