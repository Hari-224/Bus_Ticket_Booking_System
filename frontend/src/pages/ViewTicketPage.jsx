import { useState } from 'react';
import { bookingService } from '../services/busService';
import toast from 'react-hot-toast';
import { FaTicketAlt, FaEnvelope, FaMobile, FaBus, FaClock, FaQrcode, FaPrint, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './TicketView.css'; // Reusing styles
import './Auth.css'; // Reusing Auth styles for consistency

const ViewTicketPage = () => {
    const [pnr, setPnr] = useState('');
    const [contactType, setContactType] = useState('email');
    const [contactValue, setContactValue] = useState('');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!pnr || !contactValue) {
            toast.error('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await bookingService.verifyBooking(
                pnr,
                contactType === 'email' ? contactValue : null,
                contactType === 'mobile' ? contactValue : null
            );
            if (response.success) {
                setBooking(response.data);
                toast.success('Ticket found!');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Ticket not found or details mismatch');
            setBooking(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handlePrint = () => window.print();

    return (
        <div className="auth-page">
            <div className="container">
                {!booking ? (
                    <div className="auth-container" style={{ margin: '0 auto' }}>
                        <div className="auth-card card-glass animate-slideUp">
                            <div className="auth-header">
                                <div className="auth-logo">
                                    <FaTicketAlt />
                                </div>
                                <h1>Find Your Ticket</h1>
                                <p>Enter PNR and contact details to view</p>
                            </div>

                            <form onSubmit={handleSearch} className="auth-form">
                                <div className="form-group">
                                    <label className="form-label">PNR Number</label>
                                    <div className="input-with-icon">
                                        <FaBus className="input-icon" />
                                        <input
                                            type="text"
                                            value={pnr}
                                            onChange={(e) => setPnr(e.target.value)}
                                            placeholder="Enter PNR"
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Verify Using</label>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
                                            <input
                                                type="radio"
                                                checked={contactType === 'email'}
                                                onChange={() => setContactType('email')}
                                                style={{ marginRight: '0.5rem' }}
                                            />
                                            Email
                                        </label>
                                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}>
                                            <input
                                                type="radio"
                                                checked={contactType === 'mobile'}
                                                onChange={() => setContactType('mobile')}
                                                style={{ marginRight: '0.5rem' }}
                                            />
                                            Mobile
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        {contactType === 'email' ? 'Email Address' : 'Mobile Number'}
                                    </label>
                                    <div className="input-with-icon">
                                        {contactType === 'email' ?
                                            <FaEnvelope className="input-icon" /> :
                                            <FaMobile className="input-icon" />
                                        }
                                        <input
                                            type={contactType === 'email' ? 'email' : 'tel'}
                                            value={contactValue}
                                            onChange={(e) => setContactValue(e.target.value)}
                                            placeholder={contactType === 'email' ? 'Enter Email' : 'Enter Mobile'}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary btn-lg auth-btn"
                                >
                                    {loading ? 'Searching...' : 'Find Ticket'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="ticket-view-page">
                        <div className="ticket-container animate-slideUp">
                            <button
                                onClick={() => setBooking(null)}
                                className="btn btn-secondary no-print"
                                style={{ marginBottom: '1rem' }}
                            >
                                <FaArrowLeft /> Search Again
                            </button>
                            <div className="ticket">
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
                                    </div>
                                </div>

                                <div className="passengers-section">
                                    <h4>Passenger Details</h4>
                                    <div className="passengers-table">
                                        <div className="table-header">
                                            <span>Name</span>
                                            <span>Seat</span>
                                            <span>Status</span>
                                        </div>
                                        {booking?.passengers?.map((passenger, index) => (
                                            <div key={index} className={`table-row`}>
                                                <span>{passenger.name}</span>
                                                <span className="seat-number">{passenger.seatNumber}</span>
                                                <span>{passenger.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="contact-section" style={{ marginTop: '1rem', borderTop: '1px dashed #e5e7eb', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div className="contact-item">
                                            <FaEnvelope /> {booking?.contactEmail}
                                        </div>
                                        <div className="contact-item">
                                            <FaMobile /> {booking?.contactPhone}
                                        </div>
                                    </div>
                                </div>

                                <div className="ticket-actions no-print" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                    <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                        <FaPrint />
                                        <span>Print Ticket</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTicketPage;
