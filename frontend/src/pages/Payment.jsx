import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { bookingService } from '../services/busService';
import toast from 'react-hot-toast';
import './Payment.css';

const Payment = () => {
    const { pnr } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [paymentPassword, setPaymentPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);

    useEffect(() => {
        fetchBooking();
    }, [pnr]);

    const fetchBooking = async () => {
        try {
            const response = await bookingService.getBookingByPnr(pnr);
            if (response.success) {
                if (response.data.status !== 'PENDING') {
                    toast.error('This booking is not available for payment');
                    navigate('/my-trips');
                    return;
                }
                setBooking(response.data);
            }
        } catch (error) {
            toast.error('Booking not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!paymentPassword) {
            toast.error('Please enter the payment password');
            return;
        }

        setProcessing(true);
        try {
            const response = await bookingService.confirmPayment(pnr, paymentPassword);
            setPaymentResult(response.data);

            if (response.data.status === 'SUCCESS') {
                toast.success('Payment successful!');
                setTimeout(() => {
                    navigate(`/booking-confirmation/${pnr}`);
                }, 2000);
            } else {
                toast.error('Payment failed. Please try again.');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Payment failed';
            toast.error(message);
            setPaymentResult({ status: 'FAILED', message });
        } finally {
            setProcessing(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
                <p>Loading payment details...</p>
            </div>
        );
    }

    return (
        <div className="payment-page page-container">
            <div className="container">
                <div className="payment-layout">
                    {/* Payment Form */}
                    <div className="payment-form-container animate-slideUp">
                        {paymentResult ? (
                            <div className="payment-result card-glass">
                                {paymentResult.status === 'SUCCESS' ? (
                                    <div className="result-content success">
                                        <FaCheckCircle className="result-icon" />
                                        <h2>Payment Successful!</h2>
                                        <p>Your booking has been confirmed.</p>
                                        <p className="transaction-id">Transaction ID: {paymentResult.transactionId}</p>
                                        <p className="redirect-text">Redirecting to your ticket...</p>
                                    </div>
                                ) : (
                                    <div className="result-content failed">
                                        <FaTimesCircle className="result-icon" />
                                        <h2>Payment Failed</h2>
                                        <p>{paymentResult.message || 'Your payment could not be processed.'}</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setPaymentResult(null);
                                                setPaymentPassword('');
                                            }}
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="payment-form card-glass">
                                <div className="payment-header">
                                    <FaCreditCard className="payment-icon" />
                                    <h1>Payment</h1>
                                    <p>Complete your booking</p>
                                </div>

                                <div className="payment-info-box">
                                    <FaInfoCircle />
                                    <div>
                                        <strong>Dummy Payment System</strong>
                                        <p>Use password: <code>pay123</code> for successful payment</p>
                                        <p>Any other password will simulate a failed payment</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePayment}>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaLock className="label-icon" />
                                            Payment Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Enter payment password"
                                            value={paymentPassword}
                                            onChange={(e) => setPaymentPassword(e.target.value)}
                                            disabled={processing}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg pay-btn"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <span className="btn-loading">
                                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                                Processing Payment...
                                            </span>
                                        ) : (
                                            <>
                                                <FaLock />
                                                <span>Pay ₹{Math.round(booking?.fare?.finalAmount || 0)}</span>
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="security-badge">
                                    <FaLock />
                                    <span>Your payment is secured with 256-bit encryption</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary card animate-slideUp" style={{ animationDelay: '100ms' }}>
                        <h3>Order Summary</h3>

                        <div className="summary-section">
                            <label>PNR</label>
                            <span className="pnr-value">{booking?.pnr}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-section">
                            <label>Journey</label>
                            <div className="journey-info">
                                <span>{booking?.journey?.source} → {booking?.journey?.destination}</span>
                                <span className="journey-time">{formatDateTime(booking?.journey?.departureTime)}</span>
                            </div>
                        </div>

                        <div className="summary-section">
                            <label>Bus</label>
                            <span>{booking?.bus?.busName}</span>
                        </div>

                        <div className="summary-section">
                            <label>Seats</label>
                            <span>{booking?.seatNumbers?.join(', ')}</span>
                        </div>

                        <div className="summary-section">
                            <label>Passengers</label>
                            <div className="passengers-list">
                                {booking?.passengers?.map((p, i) => (
                                    <span key={i}>{p.name} (Seat {p.seatNumber})</span>
                                ))}
                            </div>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="fare-details">
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
                        </div>

                        <div className="summary-divider"></div>

                        <div className="total-section">
                            <span>Total Amount</span>
                            <span className="total-amount">₹{Math.round(booking?.fare?.finalAmount || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
