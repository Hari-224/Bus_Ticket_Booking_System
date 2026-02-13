import api from './api';

export const routeService = {
    getAllRoutes: async () => {
        const response = await api.get('/api/routes');
        return response.data;
    },

    getDestinationsBySource: async (source) => {
        const response = await api.get(`/api/routes/destinations?source=${encodeURIComponent(source)}`);
        return response.data;
    },
};

export const searchService = {
    searchBuses: async (source, destination, date) => {
        const response = await api.get('/api/search', {
            params: { source, destination, date }
        });
        return response.data;
    },
};
export const seatService = {
    getSeatLayout: async (scheduleId) => {
        const response = await api.get(`/api/seats/${scheduleId}`);
        return response.data;
    },

    lockSeats: async (scheduleId, seatIds) => {
        const response = await api.post('/api/seats/lock', { scheduleId, seatIds });
        return response.data;
    },

    releaseSeats: async (scheduleId, seatIds) => {
        const response = await api.post(`/api/seats/release?scheduleId=${scheduleId}`, seatIds);
        return response.data;
    },
};

export const bookingService = {
    createBooking: async (bookingData) => {
        const response = await api.post('/api/bookings/create', bookingData);
        return response.data;
    },

    confirmPayment: async (pnr, paymentPassword) => {
        const response = await api.post('/api/bookings/confirm-payment', { pnr, paymentPassword });
        return response.data;
    },

    getBookingByPnr: async (pnr) => {
        const response = await api.get(`/api/bookings/${pnr}`);
        return response.data;
    },

    verifyBooking: async (pnr, email, mobile) => {
        const response = await api.post('/api/bookings/ticket/verify', { pnr, email, mobile });
        return response.data;
    },

    getMyTrips: async () => {
        const response = await api.get('/api/bookings/my-trips');
        return response.data;
    },

    cancelBooking: async (pnr, passengerIdsToCancel = null, reason = '') => {
        const response = await api.post('/api/bookings/cancel', {
            pnr,
            passengerIdsToCancel,
            reason
        });
        return response.data;
    },
};
