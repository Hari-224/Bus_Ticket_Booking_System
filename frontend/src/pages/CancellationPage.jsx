import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaLock, FaTicketAlt } from 'react-icons/fa';

const CancellationPage = () => {
    return (
        <div className="page-container">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="card animate-slideUp">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ marginBottom: '0.5rem' }}>Cancellation & Refund Policy</h1>
                        <p className="text-muted">Review our policies before cancelling your trip</p>
                    </div>

                    <div className="policy-section" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Refund Rules</h3>
                        <div className="grid grid-2" style={{ gap: '1rem' }}>
                            <div className="rule-item" style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong className="text-success">95% Refund</strong>
                                <p className="text-sm text-muted">If cancelled 48 hours before departure</p>
                            </div>
                            <div className="rule-item" style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong className="text-success">75% Refund</strong>
                                <p className="text-sm text-muted">If cancelled 24 hours before departure</p>
                            </div>
                            <div className="rule-item" style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong className="text-warning">50% Refund</strong>
                                <p className="text-sm text-muted">If cancelled 6 hours before departure</p>
                            </div>
                            <div className="rule-item" style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong className="text-error">25% Refund</strong>
                                <p className="text-sm text-muted">If cancelled less than 6 hours before departure</p>
                            </div>
                        </div>
                    </div>

                    <div className="how-to-cancel" style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>How to Cancel</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <FaExclamationCircle className="text-primary" style={{ marginTop: '0.25rem' }} />
                            <p className="text-muted">
                                For security reasons, cancellations can only be performed by the user who made the booking.
                                Please <strong>log in</strong> and go to the <strong>My Trips</strong> section to manage your bookings.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <Link to="/login" className="btn btn-primary">
                            <FaLock /> Login to Cancel
                        </Link>
                        <Link to="/view-ticket" className="btn btn-secondary">
                            <FaTicketAlt /> Find Ticket (View Only)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationPage;
