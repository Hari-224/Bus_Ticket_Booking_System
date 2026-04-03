import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaShieldAlt, FaClock, FaHeadset, FaWifi, FaSnowflake, FaChair, FaStar } from 'react-icons/fa';
import { routeService } from '../services/busService';
import toast from 'react-hot-toast';

const homeStyles = `
.home-page {
    min-height: 100vh;
}

.hero {
    position: relative;
    min-height: 70vh;
    display: flex;
    align-items: center;
    padding: var(--spacing-2xl) 0;
    overflow: hidden;
    background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
}

.hero-background {
    position: absolute;
    inset: 0;
    z-index: 0;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 60%);
}

.hero-content {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    position: relative;
    z-index: 1;
}

.hero-text {
    text-align: center;
    margin-bottom: var(--spacing-3xl);
}

.hero-title {
    font-size: clamp(2.5rem, 7vw, 4.5rem);
    font-weight: 900;
    margin-bottom: var(--spacing-lg);
    letter-spacing: -0.03em;
    line-height: 1.1;
}

.hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: var(--text-secondary);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.7;
}

.search-form {
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
}

.search-fields {
    display: grid;
    grid-template-columns: 1fr auto 1fr 1fr auto;
    gap: var(--spacing-lg);
    align-items: end;
}

.search-field {
    margin-bottom: 0;
}

.label-icon {
    margin-right: var(--spacing-xs);
    color: var(--accent-primary);
    font-size: 1.1rem;
}

.swap-icon-container {
    display: flex;
    align-items: center;
    padding-bottom: var(--spacing-md);
}

.swap-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid var(--accent-primary);
    border-radius: var(--radius-full);
    color: var(--accent-primary);
    font-size: 1.1rem;
}

.search-btn {
    min-width: 180px;
}

.features-section {
    padding: var(--spacing-2xl) 0;
    background: white;
}

.section-title {
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    margin-bottom: var(--spacing-2xl);
    text-align: center;
    font-weight: 700;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-xl);
}

.feature-card {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-color);
}

.feature-icon {
    width: 70px;
    height: 70px;
    margin: 0 auto var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-primary);
    border-radius: var(--radius-xl);
    font-size: 2rem;
    color: white;
}

.feature-card h3 {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-lg);
    color: var(--text-primary);
}

.feature-card p {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    line-height: 1.6;
}

.amenities-section {
    padding: var(--spacing-2xl) 0;
    background: var(--bg-primary);
}

.amenities-grid {
    display: flex;
    justify-content: center;
    gap: var(--spacing-2xl);
    flex-wrap: wrap;
}

.amenity-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
}

.amenity-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px solid var(--accent-primary);
    border-radius: var(--radius-lg);
    font-size: 1.5rem;
    color: var(--accent-primary);
}

.amenity-item span {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    font-weight: 500;
}

.stats-section {
    padding: var(--spacing-2xl) 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xl);
    text-align: center;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
}

.stat-value {
    font-size: var(--font-size-4xl);
    font-weight: 800;
}

.stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.footer {
    padding: var(--spacing-xl) 0;
    border-top: 1px solid var(--border-color);
    margin-top: var(--spacing-2xl);
}

@media (max-width: 1024px) {
    .search-fields {
        grid-template-columns: 1fr 1fr;
    }

    .swap-icon-container {
        display: none;
    }

    .search-btn {
        grid-column: 1 / -1;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .hero {
        min-height: 60vh;
        padding: var(--spacing-xl) 0;
    }

    .hero-title {
        font-size: 2rem;
    }

    .search-form {
        padding: var(--spacing-lg);
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .search-fields {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
    }

    .amenities-grid {
        gap: var(--spacing-xl);
    }

    .footer-content {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
    }
}
`;

const Home = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState({ sources: [], destinations: [] });
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchAttempted, setSearchAttempted] = useState(false);

    useEffect(() => {
        fetchRoutes();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await routeService.getAllRoutes();
            if (response.success) {
                setRoutes(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchAttempted(true);

        if (!source || !destination || !date) {
            toast.error('Please fill in all fields');
            return;
        }

        if (source === destination) {
            toast.error('Source and destination cannot be the same');
            return;
        }

        toast.success('Finding the best buses for you');
        navigate(`/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${date}`);
    };

    const handleQuickRoute = (route) => {
        setSource(route.source);
        setDestination(route.destination);
        setDate(new Date().toISOString().split('T')[0]);
        setSearchAttempted(false);
        toast.success(`${route.source} to ${route.destination} loaded`);
    };

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 6);
        return maxDate.toISOString().split('T')[0];
    };

    const features = [
        { icon: <FaShieldAlt />, title: 'Safe & Secure', description: 'Your transactions are protected with bank-grade security' },
        { icon: <FaClock />, title: 'Instant Booking', description: 'Get your tickets confirmed in seconds' },
        { icon: <FaHeadset />, title: '24/7 Support', description: 'Our support team is always here to help' },
    ];

    const amenities = [
        { icon: <FaWifi />, name: 'Free WiFi' },
        { icon: <FaSnowflake />, name: 'AC Buses' },
        { icon: <FaChair />, name: 'Comfortable Seats' },
        { icon: <FaBus />, name: 'GPS Tracking' },
    ];

    const trustStats = [
        { label: 'Live seat availability', icon: <FaBus /> },
        { label: 'Real-time booking updates', icon: <FaClock /> },
        { label: 'Secure checkout', icon: <FaShieldAlt /> },
        { label: 'Instant confirmation', icon: <FaHeadset /> },
    ];

    const popularRoutes = [
        { source: 'Bengaluru', destination: 'Chennai', duration: '6h 45m', price: 'From ₹799', tag: 'Night Saver' },
        { source: 'Hyderabad', destination: 'Pune', duration: '8h 10m', price: 'From ₹899', tag: 'Volvo AC' },
        { source: 'Mumbai', destination: 'Goa', duration: '10h 00m', price: 'From ₹1,099', tag: 'Beach Express' },
        { source: 'Delhi', destination: 'Jaipur', duration: '5h 15m', price: 'From ₹699', tag: 'Fast Route' },
    ];

    const offers = [
        { title: 'Weekend Saver', code: 'BUSWEEKEND', text: 'Save up to 20% on selected routes this weekend.' },
        { title: 'First Ride Offer', code: 'FIRSTBUS', text: 'New users get instant discounts on their first booking.' },
    ];

    const whyChooseUs = [
        { icon: <FaShieldAlt />, title: 'Verified operators', text: 'Book only from trusted travel partners with clear trip details.' },
        { icon: <FaClock />, title: 'Fast booking', text: 'Find buses, compare options, and reserve seats in a few clicks.' },
        { icon: <FaHeadset />, title: '24/7 support', text: 'Human support when plans change, with prompt booking assistance.' },
        { icon: <FaBus />, title: 'Comfort first', text: 'Choose AC, sleeper, and premium buses with seat transparency.' },
    ];

    const testimonials = [
        { name: 'Ananya R.', role: 'Frequent traveler', quote: 'Search is clear, seat options update quickly, and checkout feels safe.', rating: 5 },
        { name: 'Rahul S.', role: 'Weekend commuter', quote: 'I can book in a couple of minutes and ticket confirmation is instant.', rating: 4 },
        { name: 'Meera P.', role: 'Business traveler', quote: 'Simple layout, accurate route details, and a smooth booking experience.', rating: 4 },
    ];

    const footerLinks = [
        { label: 'Search Buses', to: '/search' },
        { label: 'My Trips', to: '/my-trips' },
        { label: 'View Ticket', to: '/view-ticket' },
        { label: 'Cancel Ticket', to: '/cancellation' },
    ];

    const supportLinks = [
        { label: 'Help Center', href: '#' },
        { label: 'FAQs', href: '#' },
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Privacy Policy', href: '#' },
    ];

    return (
        <div className="home-page">
            <style>{homeStyles}</style>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>

                <div className="hero-content container max-w-7xl mx-auto">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Travel Made <span className="text-gradient">Simple</span>
                        </h1>
                        <p className="hero-subtitle">
                            Book bus tickets instantly. Discover comfortable journeys across 500+ routes with top-rated operators.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {trustStats.map((item) => (
                                <div
                                    key={item.label}
                                    className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <span className="text-blue-600">{item.icon}</span>
                                    <span className="font-medium text-slate-600">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search Form */}
                    <form className="search-form card-glass border border-white/70 bg-white/90 backdrop-blur-xl" onSubmit={handleSearch}>
                        <div className="search-fields">
                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" />
                                    From
                                </label>
                                <select
                                    className={`form-input form-select transition-all duration-200 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${searchAttempted && !source ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    disabled={loading}
                                    aria-invalid={searchAttempted && !source}
                                >
                                    <option value="">Select Source</option>
                                    {routes.sources?.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="swap-icon-container">
                                <div className="swap-icon">⇄</div>
                            </div>

                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" />
                                    To
                                </label>
                                <select
                                    className={`form-input form-select transition-all duration-200 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${searchAttempted && !destination ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    disabled={loading}
                                    aria-invalid={searchAttempted && !destination}
                                >
                                    <option value="">Select Destination</option>
                                    {routes.destinations?.filter(city => city !== source).map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    className={`form-input transition-all duration-200 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${searchAttempted && !date ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    aria-invalid={searchAttempted && !date}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg search-btn rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:ring-blue-200 active:scale-[0.99]">  
                                <FaSearch />
                                <span>Search Buses</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section container max-w-7xl mx-auto">
                <h2 className="section-title text-center">Why Choose <span className="text-gradient">BusEase</span></h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card card animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Amenities Section */}
            <section className="amenities-section">
                <div className="container max-w-7xl mx-auto">
                    <h2 className="section-title text-center">Premium <span className="text-gradient">Amenities</span></h2>
                    <div className="amenities-grid">
                        {amenities.map((amenity, index) => (
                            <div key={index} className="amenity-item">
                                <div className="amenity-icon">{amenity.icon}</div>
                                <span>{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section container max-w-7xl mx-auto">
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value text-gradient">Live</span>
                        <span className="stat-label">Seat availability</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-gradient">Real-time</span>
                        <span className="stat-label">Booking updates</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-gradient">Secure</span>
                        <span className="stat-label">Checkout flow</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value text-gradient">Instant</span>
                        <span className="stat-label">Ticket confirmation</span>
                    </div>
                </div>
            </section>

            <section className="mt-4 py-16">
                <div className="container max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-end">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Popular routes</p>
                            <h2 className="text-3xl font-bold text-slate-900">Frequently booked journeys</h2>
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-slate-500 lg:text-right">Quickly jump into common routes to compare timings, fares, and seat availability.</p>
                    </div>

                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                                    <div className="mb-4 h-4 w-24 rounded-full bg-slate-200"></div>
                                    <div className="mb-2 h-7 w-40 rounded bg-slate-200"></div>
                                    <div className="mb-6 h-4 w-32 rounded bg-slate-200"></div>
                                    <div className="h-12 rounded-xl bg-slate-200"></div>
                                </div>
                            ))}
                        </div>
                    ) : popularRoutes.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {popularRoutes.map((route) => (
                                <div key={`${route.source}-${route.destination}`} className="group flex h-full min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
                                    <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{route.tag}</div>
                                    <div className="flex min-h-[86px] items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-lg font-bold leading-7 text-slate-900">{route.source} → {route.destination}</p>
                                            <p className="mt-1 text-sm text-slate-500">{route.duration}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold text-slate-500">Fare</p>
                                            <p className="text-lg font-bold text-blue-600">{route.price}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-auto w-full rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md focus:ring-2 focus:ring-blue-100 active:scale-[0.99]"
                                        onClick={() => handleQuickRoute(route)}
                                    >
                                        Use this route
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                            No popular routes are available right now. Try searching directly with your travel details.
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-2 py-8">
                <div className="container max-w-7xl mx-auto">
                    <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-6 py-8 shadow-sm md:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Offers & discounts</p>
                                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Save more on every booking</h2>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">Simple, transparent offers that reward repeat travel without cluttering the booking experience.</p>
                            </div>
                            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
                                {offers.map((offer) => (
                                    <div key={offer.code} className="h-full rounded-2xl border border-white/80 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
                                        <p className="text-sm font-semibold text-slate-900">{offer.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">{offer.text}</p>
                                        <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Code: {offer.code}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-4 bg-white/60 py-16">
                <div className="container max-w-7xl mx-auto">
                    <div className="mb-8 text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Why choose us</p>
                        <h2 className="text-3xl font-bold text-slate-900">Built for trust and convenience</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {whyChooseUs.map((item) => (
                            <div key={item.title} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">{item.icon}</div>
                                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-4 py-16">
                <div className="container max-w-7xl mx-auto">
                    <div className="mb-8 text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Testimonials</p>
                        <h2 className="text-3xl font-bold text-slate-900">What travelers say</h2>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {testimonials.map((item) => (
                            <div key={item.name} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.role}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <FaStar key={starIndex} className={starIndex < item.rating ? 'text-amber-500' : 'text-amber-200'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="flex-1 text-sm leading-7 text-slate-600">“{item.quote}”</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200 bg-white/80 py-12">
                <div className="container max-w-7xl mx-auto">
                    <div className="grid gap-8 lg:grid-cols-4">
                        <div>
                            <div className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
                                <FaBus className="text-blue-600" />
                                <span>BusEase</span>
                            </div>
                            <p className="text-sm leading-6 text-slate-500">
                                A trusted, easy-to-use booking experience for everyday trips and long-distance journeys.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">Quick links</h3>
                            <ul className="space-y-2 text-sm text-slate-500">
                                {footerLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.to} className="transition-colors duration-200 hover:text-blue-600">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">Support</h3>
                            <ul className="space-y-2 text-sm text-slate-500">
                                {supportLinks.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="transition-colors duration-200 hover:text-blue-600">{link.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-700">Contact</h3>
                            <div className="space-y-2 text-sm text-slate-500">
                                <p>support@busease.com</p>
                                <p>+1 (555) 123-4567</p>
                                <p>24/7 support for booking help and trip updates</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
export default Home;
