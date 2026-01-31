import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTicketAlt, FaBus, FaMapMarkerAlt, FaClock, FaUser, FaQrcode, FaDownload, FaHome } from 'react-icons/fa';
import { bookingService } from '../services/busService';
import toast from 'react-hot-toast';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
    const { pnr } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [pnr]);

    const fetchBooking = async () => {
        try {
            const response = await bookingService.getBookingByPnr(pnr);
            if (response.success) {
                setBooking(response.data);
            }
        } catch (error) {
            toast.error('Booking not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading booking details...</p>
            </div>
        );
    }

    return (
        <div className="confirmation-page page-container">
            <div className="container">
                <div className="confirmation-content animate-slideUp">
                    {/* Success Header */}
                    <div className="success-header">
                        <div className="success-icon-wrapper">
                            <FaCheckCircle className="success-icon" />
                        </div>
                        <h1>Booking Confirmed!</h1>
                        <p>Your ticket has been booked successfully</p>
                    </div>

                    {/* PNR Card */}
                    <div className="pnr-card card-glass">
                        <div className="pnr-label">Your PNR Number</div>
                        <div className="pnr-number">{booking?.pnr}</div>
                        <p className="pnr-info">Save this number for future reference</p>
                    </div>

                    {/* Ticket Summary */}
                    <div className="ticket-summary card">
                        <div className="ticket-header">
                            <FaTicketAlt className="ticket-icon" />
                            <h2>Ticket Details</h2>
                        </div>

                        <div className="ticket-body">
                            {/* Bus Info */}
                            <div className="info-section">
                                <FaBus className="section-icon" />
                                <div>
                                    <h4>{booking?.bus?.busName}</h4>
                                    <span className="bus-number">{booking?.bus?.busNumber}</span>
                                    <span className="bus-type badge badge-primary">{booking?.bus?.busType?.replace(/_/g, ' ')}</span>
                                </div>
                            </div>

                            {/* Journey Info */}
                            <div className="journey-section">
                                <div className="journey-point">
                                    <div className="point-marker departure"></div>
                                    <div className="point-details">
                                        <span className="point-city">{booking?.journey?.source}</span>
                                        <span className="point-time">{formatDateTime(booking?.journey?.departureTime)}</span>
                                    </div>
                                </div>
                                <div className="journey-line"></div>
                                <div className="journey-point">
                                    <div className="point-marker arrival"></div>
                                    <div className="point-details">
                                        <span className="point-city">{booking?.journey?.destination}</span>
                                        <span className="point-time">{formatDateTime(booking?.journey?.arrivalTime)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Passengers */}
                            <div className="passengers-section">
                                <h4>Passengers</h4>
                                <div className="passengers-grid">
                                    {booking?.passengers?.map((passenger, index) => (
                                        <div key={index} className="passenger-item">
                                            <FaUser className="passenger-icon" />
                                            <div className="passenger-info">
                                                <span className="passenger-name">{passenger.name}</span>
                                                <span className="passenger-details">{passenger.age} yrs, {passenger.gender}</span>
                                            </div>
                                            <span className="passenger-seat">Seat {passenger.seatNumber}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fare Details */}
                            <div className="fare-section">
                                <div className="fare-row">
                                    <span>Amount Paid</span>
                                    <span className="fare-amount">₹{Math.round(booking?.fare?.finalAmount || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="confirmation-actions">
                        <Link to={`/ticket/${pnr}`} className="btn btn-primary btn-lg">
                            <FaTicketAlt />
                            <span>View Ticket</span>
                        </Link>
                        <Link to="/my-trips" className="btn btn-secondary btn-lg">
                            <FaClock />
                            <span>My Trips</span>
                        </Link>
                        <Link to="/" className="btn btn-outline btn-lg">
                            <FaHome />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
