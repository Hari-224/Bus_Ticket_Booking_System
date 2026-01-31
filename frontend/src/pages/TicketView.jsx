import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaTicketAlt, FaBus, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaQrcode, FaPrint, FaTimesCircle, FaChair, FaArrowLeft } from 'react-icons/fa';
import { bookingService } from '../services/busService';
import toast from 'react-hot-toast';
import './TicketView.css';

const TicketView = () => {
    const { pnr } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

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
            navigate('/my-trips');
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

    const formatTime = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleCancelBooking = async () => {
        setCancelling(true);
        try {
            const response = await bookingService.cancelBooking(pnr);
            if (response.success) {
                toast.success(response.data.message);
                setShowCancelModal(false);
                fetchBooking();
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to cancel booking';
            toast.error(message);
        } finally {
            setCancelling(false);
        }
    };

    const isUpcoming = () => {
        return new Date(booking?.journey?.departureTime) > new Date();
    };

    const canCancel = () => {
        return booking?.status === 'CONFIRMED' && isUpcoming();
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading ticket...</p>
            </div>
        );
    }

    return (
        <div className="ticket-view-page page-container">
            <div className="container">
                {/* Back Button */}
                <Link to="/my-trips" className="back-link">
                    <FaArrowLeft />
                    <span>Back to My Trips</span>
                </Link>

                {/* Ticket */}
                <div className="ticket-container animate-slideUp">
                    <div className="ticket">
                        {/* Ticket Header */}
                        <div className="ticket-header">
                            <div className="ticket-brand">
                                <FaBus className="brand-icon" />
                                <span>BusEase</span>
                            </div>
                            <div className="ticket-status">
                                <span className={`status-badge ${booking?.status?.toLowerCase()}`}>
                                    {booking?.status}
                                </span>
                            </div>
                        </div>

                        {/* PNR Section */}
                        <div className="pnr-section">
                            <div className="pnr-info">
                                <span className="pnr-label">PNR Number</span>
                                <span className="pnr-value">{booking?.pnr}</span>
                            </div>
                            <div className="qr-placeholder">
                                <FaQrcode />
                                <span>QR Code</span>
                            </div>
                        </div>

                        <div className="ticket-divider">
                            <div className="divider-circle left"></div>
                            <div className="divider-line"></div>
                            <div className="divider-circle right"></div>
                        </div>

                        {/* Journey Section */}
                        <div className="journey-section">
                            <div className="journey-date">
                                <FaClock />
                                <span>{formatDate(booking?.journey?.departureTime)}</span>
                            </div>

                            <div className="journey-route">
                                <div className="route-point departure">
                                    <div className="point-marker"></div>
                                    <div className="point-info">
                                        <span className="point-time">{formatTime(booking?.journey?.departureTime)}</span>
                                        <span className="point-city">{booking?.journey?.source}</span>
                                    </div>
                                </div>

                                <div className="route-connector">
                                    <div className="connector-line"></div>
                                    <div className="connector-duration">{booking?.journey?.durationHours}h journey</div>
                                </div>

                                <div className="route-point arrival">
                                    <div className="point-marker"></div>
                                    <div className="point-info">
                                        <span className="point-time">{formatTime(booking?.journey?.arrivalTime)}</span>
                                        <span className="point-city">{booking?.journey?.destination}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-divider">
                            <div className="divider-circle left"></div>
                            <div className="divider-line"></div>
                            <div className="divider-circle right"></div>
                        </div>

                        {/* Bus Details */}
                        <div className="bus-section">
                            <h4>Bus Details</h4>
                            <div className="bus-info-grid">
                                <div className="info-item">
                                    <span className="info-label">Bus Name</span>
                                    <span className="info-value">{booking?.bus?.busName}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Bus Number</span>
                                    <span className="info-value">{booking?.bus?.busNumber}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Type</span>
                                    <span className="info-value">{booking?.bus?.busType?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Operator</span>
                                    <span className="info-value">{booking?.bus?.operatorName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="ticket-divider">
                            <div className="divider-circle left"></div>
                            <div className="divider-line"></div>
                            <div className="divider-circle right"></div>
                        </div>

                        {/* Passengers */}
                        <div className="passengers-section">
                            <h4>Passenger Details</h4>
                            <div className="passengers-table">
                                <div className="table-header">
                                    <span>Name</span>
                                    <span>Age</span>
                                    <span>Gender</span>
                                    <span>Seat</span>
                                </div>
                                {booking?.passengers?.map((passenger, index) => (
                                    <div key={index} className={`table-row ${passenger.status === 'CANCELLED' ? 'cancelled' : ''}`}>
                                        <span>{passenger.name}</span>
                                        <span>{passenger.age}</span>
                                        <span>{passenger.gender}</span>
                                        <span className="seat-number">{passenger.seatNumber}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="ticket-divider">
                            <div className="divider-circle left"></div>
                            <div className="divider-line"></div>
                            <div className="divider-circle right"></div>
                        </div>

                        {/* Fare Details */}
                        <div className="fare-section">
                            <h4>Fare Details</h4>
                            <div className="fare-breakdown">
                                <div className="fare-row">
                                    <span>Base Fare</span>
                                    <span>₹{Math.round(booking?.fare?.baseFare || 0)}</span>
                                </div>
                                {booking?.fare?.discountAmount > 0 && (
                                    <div className="fare-row discount">
                                        <span>Discount</span>
                                        <span>-₹{Math.round(booking?.fare?.discountAmount)}</span>
                                    </div>
                                )}
                                {booking?.refundAmount > 0 && (
                                    <div className="fare-row refund">
                                        <span>Refund</span>
                                        <span>+₹{Math.round(booking?.refundAmount)}</span>
                                    </div>
                                )}
                                <div className="fare-row total">
                                    <span>Total Paid</span>
                                    <span>₹{Math.round(booking?.fare?.finalAmount || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="contact-section">
                            <div className="contact-item">
                                <FaEnvelope />
                                <span>{booking?.contactEmail}</span>
                            </div>
                            <div className="contact-item">
                                <FaPhone />
                                <span>{booking?.contactPhone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="ticket-actions no-print">
                    <button className="btn btn-secondary" onClick={handlePrint}>
                        <FaPrint />
                        <span>Print Ticket</span>
                    </button>
                    {canCancel() && (
                        <button className="btn btn-danger" onClick={() => setShowCancelModal(true)}>
                            <FaTimesCircle />
                            <span>Cancel Booking</span>
                        </button>
                    )}
                </div>

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                        <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
                            <h3>Cancel Booking</h3>
                            <p>Are you sure you want to cancel this booking?</p>
                            <p className="cancel-note">
                                Refund will be processed based on cancellation policy.
                                Cancellations within 24 hours of departure may have reduced refunds.
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelling}
                                >
                                    Keep Booking
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleCancelBooking}
                                    disabled={cancelling}
                                >
                                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketView;
