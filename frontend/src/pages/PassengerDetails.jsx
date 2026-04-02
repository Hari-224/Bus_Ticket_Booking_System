import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBirthdayCake, FaVenusMars, FaChair, FaArrowRight, FaClock, FaEnvelope, FaPhone } from 'react-icons/fa';
import { bookingService } from '../services/busService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PassengerDetails.css';

const PassengerDetails = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [bookingData, setBookingData] = useState(null);
    const [passengers, setPassengers] = useState([]);
    const [contactInfo, setContactInfo] = useState({
        email: user?.email || '',
        phone: user?.mobile || '',
    });
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const storedData = localStorage.getItem('pendingBooking');
        if (!storedData) {
            toast.error('No booking data found. Please select seats first.');
            navigate('/');
            return;
        }

        const data = JSON.parse(storedData);
        setBookingData(data);

        // Initialize passengers
        const initialPassengers = data.seats.map((seat, index) => ({
            seatId: seat.id,
            seatNumber: seat.seatNumber,
            name: index === 0 ? user?.name || '' : '',
            age: '',
            gender: '',
        }));
        setPassengers(initialPassengers);

        // Prefer duration-based lock timing to avoid timezone issues across environments.
        const lockDurationSeconds = Number(data.lockDurationSeconds || 0);
        const lockedAtEpochMs = Number(data.lockedAtEpochMs || 0);

        let expiryEpochMs = 0;
        if (lockDurationSeconds > 0 && lockedAtEpochMs > 0) {
            expiryEpochMs = lockedAtEpochMs + lockDurationSeconds * 1000;
        } else if (data.lockExpiry) {
            // Backward compatibility for older pendingBooking format.
            expiryEpochMs = new Date(data.lockExpiry).getTime();
        }

        if (expiryEpochMs > 0) {
            const updateCountdown = () => {
                const remaining = Math.max(0, Math.floor((expiryEpochMs - Date.now()) / 1000));
                setCountdown(remaining);
                if (remaining === 0) {
                    toast.error('Seat lock expired. Please select seats again.');
                    localStorage.removeItem('pendingBooking');
                    navigate('/');
                }
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
        }
    }, [navigate, user]);

    const handlePassengerChange = (index, field, value) => {
        setPassengers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const validateForm = () => {
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.name.trim()) {
                toast.error(`Please enter name for passenger ${i + 1}`);
                return false;
            }
            if (!p.age || p.age < 1 || p.age > 120) {
                toast.error(`Please enter valid age for passenger ${i + 1}`);
                return false;
            }
            if (!p.gender) {
                toast.error(`Please select gender for passenger ${i + 1}`);
                return false;
            }
        }

        if (!contactInfo.email || !/\S+@\S+\.\S+/.test(contactInfo.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        if (!contactInfo.phone || !/^\d{10}$/.test(contactInfo.phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const requestData = {
                scheduleId: bookingData.scheduleId,
                seatIds: bookingData.seatIds,
                passengers: passengers.map(p => ({
                    name: p.name,
                    age: parseInt(p.age),
                    gender: p.gender,
                    seatNumber: p.seatNumber,
                })),
                contactEmail: contactInfo.email,
                contactPhone: contactInfo.phone,
            };

            const response = await bookingService.createBooking(requestData);

            if (response.success) {
                toast.success('Booking created! Proceed to payment.');
                localStorage.removeItem('pendingBooking');
                navigate(`/payment/${response.data.pnr}`);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create booking';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!bookingData) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="passenger-details-page page-container">
            <div className="container">
                <div className="passenger-details-layout">
                    <div className="passenger-forms animate-slideUp">
                        <div className="page-header">
                            <h1>Passenger Details</h1>
                            {countdown > 0 && (
                                <div className="lock-timer">
                                    <FaClock />
                                    <span>Complete in: <strong>{formatCountdown(countdown)}</strong></span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Passengers */}
                            {passengers.map((passenger, index) => (
                                <div key={index} className="passenger-card card">
                                    <div className="passenger-header">
                                        <h3>Passenger {index + 1}</h3>
                                        <div className="seat-tag">
                                            <FaChair />
                                            <span>{passenger.seatNumber}</span>
                                        </div>
                                    </div>

                                    <div className="passenger-fields">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <FaUser className="label-icon" />
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Enter full name"
                                                value={passenger.name}
                                                onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                <FaBirthdayCake className="label-icon" />
                                                Age
                                            </label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                placeholder="Age"
                                                min="1"
                                                max="120"
                                                value={passenger.age}
                                                onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                <FaVenusMars className="label-icon" />
                                                Gender
                                            </label>
                                            <select
                                                className="form-input form-select"
                                                value={passenger.gender}
                                                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Contact Information */}
                            <div className="contact-card card">
                                <h3>Contact Information</h3>
                                <p className="contact-info-text">Ticket details will be sent to this contact</p>

                                <div className="contact-fields">
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaEnvelope className="label-icon" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="Enter email address"
                                            value={contactInfo.email}
                                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaPhone className="label-icon" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                            value={contactInfo.phone}
                                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
                                {loading ? (
                                    <span className="btn-loading">
                                        <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                        Creating Booking...
                                    </span>
                                ) : (
                                    <>
                                        <span>Continue to Payment</span>
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="summary-sidebar card animate-slideUp" style={{ animationDelay: '100ms' }}>
                        <h3>Booking Summary</h3>

                        <div className="summary-row">
                            <span>Bus</span>
                            <span className="summary-value">{bookingData.busName}</span>
                        </div>

                        <div className="summary-row">
                            <span>Seats</span>
                            <span className="summary-value">
                                {bookingData.seats.map(s => s.seatNumber).join(', ')}
                            </span>
                        </div>

                        <div className="summary-row">
                            <span>Passengers</span>
                            <span className="summary-value">{bookingData.seats.length}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Total Amount</span>
                            <span className="total-amount">₹{Math.round(bookingData.totalFare)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PassengerDetails;
