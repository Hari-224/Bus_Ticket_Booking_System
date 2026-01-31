import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import MyTrips from './pages/MyTrips';

import TicketView from './pages/TicketView';
import ViewTicketPage from './pages/ViewTicketPage';
import CancellationPage from './pages/CancellationPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <div className="app">
            <Navbar />
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/seats/:scheduleId" element={<SeatSelection />} />
                    <Route path="/view-ticket" element={<ViewTicketPage />} />
                    <Route path="/cancellation" element={<CancellationPage />} />

                    {/* Protected Routes */}
                    <Route path="/passenger-details" element={
                        <ProtectedRoute><PassengerDetails /></ProtectedRoute>
                    } />
                    <Route path="/payment/:pnr" element={
                        <ProtectedRoute><Payment /></ProtectedRoute>
                    } />
                    <Route path="/booking-confirmation/:pnr" element={
                        <ProtectedRoute><BookingConfirmation /></ProtectedRoute>
                    } />
                    <Route path="/my-trips" element={
                        <ProtectedRoute><MyTrips /></ProtectedRoute>
                    } />
                    <Route path="/ticket/:pnr" element={
                        <ProtectedRoute><TicketView /></ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
