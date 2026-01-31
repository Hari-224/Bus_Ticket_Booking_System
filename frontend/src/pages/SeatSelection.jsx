import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBus, FaClock, FaChair, FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import { seatService } from '../services/busService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './SeatSelection.css';

const SeatSelection = () => {
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [seatLayout, setSeatLayout] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);
    const [lockExpiry, setLockExpiry] = useState(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        fetchSeatLayout();
    }, [scheduleId]);

    useEffect(() => {
        let interval;
        if (lockExpiry) {
            interval = setInterval(() => {
                const remaining = Math.max(0, Math.floor((new Date(lockExpiry) - new Date()) / 1000));
                setCountdown(remaining);

                if (remaining === 0) {
                    toast.error('Seat lock expired. Please select seats again.');
                    setSelectedSeats([]);
                    setLockExpiry(null);
                    fetchSeatLayout();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [lockExpiry]);

    const fetchSeatLayout = async () => {
        try {
            const response = await seatService.getSeatLayout(scheduleId);
            if (response.success) {
                setSeatLayout(response.data);
                // Check for user's locked seats
                const userLockedSeats = response.data.seats
                    .filter(s => s.isLockedByCurrentUser)
                    .map(s => s.id);
                if (userLockedSeats.length > 0) {
                    setSelectedSeats(userLockedSeats);
                }
            }
        } catch (error) {
            toast.error('Failed to load seat layout');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = useCallback((seat) => {
        if (seat.status === 'BOOKED') return;
        if (seat.status === 'LOCKED' && !seat.isLockedByCurrentUser) return;

        setSelectedSeats(prev => {
            if (prev.includes(seat.id)) {
                return prev.filter(id => id !== seat.id);
            } else {
                if (prev.length >= 6) {
                    toast.error('Maximum 6 seats can be selected');
                    return prev;
                }
                return [...prev, seat.id];
            }
        });
    }, []);

    const getSeatClass = (seat) => {
        let classes = ['seat'];

        if (selectedSeats.includes(seat.id)) {
            classes.push('selected');
        } else if (seat.status === 'BOOKED') {
            classes.push('booked');
        } else if (seat.status === 'LOCKED' && !seat.isLockedByCurrentUser) {
            classes.push('locked');
        } else {
            classes.push('available');
        }

        // Add seat type class
        if (seat.seatType === 'WINDOW') {
            classes.push('window');
        } else if (seat.seatType === 'SLEEPER_LOWER' || seat.seatType === 'SLEEPER_UPPER') {
            classes.push('sleeper');
        }

        return classes.join(' ');
    };

    const calculateTotal = () => {
        if (!seatLayout) return 0;
        return selectedSeats.reduce((total, seatId) => {
            const seat = seatLayout.seats.find(s => s.id === seatId);
            return total + (seat?.fare || 0);
        }, 0);
    };

    const handleLockSeats = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book tickets');
            navigate('/login', { state: { from: { pathname: `/seats/${scheduleId}` } } });
            return;
        }

        if (selectedSeats.length === 0) {
            toast.error('Please select at least one seat');
            return;
        }

        setLocking(true);
        try {
            const response = await seatService.lockSeats(scheduleId, selectedSeats);
            if (response.success) {
                toast.success(response.data.message);
                setLockExpiry(response.data.lockExpiryTime);

                // Store booking data and navigate
                const bookingData = {
                    scheduleId: parseInt(scheduleId),
                    seatIds: selectedSeats,
                    seats: seatLayout.seats.filter(s => selectedSeats.includes(s.id)),
                    busName: seatLayout.busName,
                    busNumber: seatLayout.busNumber,
                    totalFare: response.data.totalFare,
                    lockExpiry: response.data.lockExpiryTime,
                };
                localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
                navigate('/passenger-details');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to lock seats';
            toast.error(message);
            fetchSeatLayout();
        } finally {
            setLocking(false);
        }
    };

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Group seats by row
    const groupedSeats = seatLayout?.seats.reduce((acc, seat) => {
        const row = seat.rowNumber;
        if (!acc[row]) acc[row] = [];
        acc[row].push(seat);
        return acc;
    }, {}) || {};

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading seat layout...</p>
            </div>
        );
    }

    return (
        <div className="seat-selection-page page-container">
            <div className="container">
                <div className="seat-selection-layout">
                    {/* Seat Map */}
                    <div className="seat-map-container card animate-slideUp">
                        <div className="seat-map-header">
                            <div className="bus-info">
                                <FaBus className="bus-icon" />
                                <div>
                                    <h2>{seatLayout?.busName}</h2>
                                    <span className="bus-number">{seatLayout?.busNumber}</span>
                                </div>
                            </div>
                            {countdown > 0 && (
                                <div className="lock-timer">
                                    <FaClock />
                                    <span>Lock expires in: <strong>{formatCountdown(countdown)}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="seat-legend">
                            <div className="legend-item">
                                <div className="legend-seat available"></div>
                                <span>Available</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat selected"></div>
                                <span>Selected</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat booked"></div>
                                <span>Booked</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-seat locked"></div>
                                <span>Locked</span>
                            </div>
                        </div>

                        {/* Bus Structure */}
                        <div className="bus-structure">
                            <div className="bus-front">
                                <div className="driver-seat"></div>
                                <span>Front</span>
                            </div>

                            <div className="seat-grid" style={{ '--seats-per-row': seatLayout?.seatsPerRow || 4 }}>
                                {Object.entries(groupedSeats).map(([rowNum, seats]) => (
                                    <div key={rowNum} className="seat-row">
                                        {seats.sort((a, b) => a.columnNumber - b.columnNumber).map((seat, colIndex) => (
                                            <button
                                                key={seat.id}
                                                className={getSeatClass(seat)}
                                                style={{
                                                    marginRight: colIndex === 1 && seatLayout?.seatsPerRow === 4 ? '20px' : '0'
                                                }}
                                                onClick={() => handleSeatClick(seat)}
                                                disabled={seat.status === 'BOOKED' || (seat.status === 'LOCKED' && !seat.isLockedByCurrentUser)}
                                                title={`Seat ${seat.seatNumber} - ₹${seat.fare}`}
                                            >
                                                <span className="seat-number">{seat.seatNumber}</span>
                                                <span className="seat-price">₹{Math.round(seat.fare)}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="bus-back">
                                <span>Back</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="booking-summary card animate-slideUp" style={{ animationDelay: '100ms' }}>
                        <h3>Booking Summary</h3>

                        <div className="summary-section">
                            <label>Selected Seats</label>
                            {selectedSeats.length === 0 ? (
                                <p className="no-seats">No seats selected</p>
                            ) : (
                                <div className="selected-seats-list">
                                    {seatLayout?.seats
                                        .filter(s => selectedSeats.includes(s.id))
                                        .map(seat => (
                                            <div key={seat.id} className="selected-seat-chip">
                                                <FaChair />
                                                <span>{seat.seatNumber}</span>
                                                <span className="seat-fare">₹{Math.round(seat.fare)}</span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-section">
                            <label>Fare Details</label>
                            <div className="fare-row">
                                <span>Base Fare ({selectedSeats.length} seats)</span>
                                <span>₹{Math.round(calculateTotal())}</span>
                            </div>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="total-row">
                            <span>Total Amount</span>
                            <span className="total-amount">₹{Math.round(calculateTotal())}</span>
                        </div>

                        <button
                            className="btn btn-primary btn-lg proceed-btn"
                            onClick={handleLockSeats}
                            disabled={selectedSeats.length === 0 || locking}
                        >
                            {locking ? (
                                <span className="btn-loading">
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                    Processing...
                                </span>
                            ) : (
                                <>
                                    <span>Continue to Passenger Details</span>
                                    <FaArrowRight />
                                </>
                            )}
                        </button>

                        <p className="info-text">
                            <FaInfoCircle />
                            <span>Seats will be held for 5 minutes after selection</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
