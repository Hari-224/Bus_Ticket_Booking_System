# 🚌 BusEase - Bus Ticket Booking System

A full-stack, production-ready bus ticket booking web application built with **React**, **Spring Boot**, and **MySQL**. Features a stunning dark-themed UI with glassmorphism effects, secure JWT authentication, and a complete booking workflow.

![BusEase](https://img.shields.io/badge/BusEase-v1.0.0-6366f1)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6db33f)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1)

## ✨ Features

### User Features
- 🔐 **User Authentication** - Secure registration and login with JWT
- 🔍 **Bus Search** - Find buses by source, destination, and date
- 🪑 **Interactive Seat Selection** - Visual seat map with real-time availability
- ⏱️ **Seat Lock Timer** - 5-minute hold on selected seats
- 📝 **Passenger Details** - Enter traveler information with validation
- 💳 **Dummy Payment** - Simulated payment gateway
- 🎫 **E-Ticket** - Digital ticket with PNR and all journey details
- 📋 **My Trips** - View upcoming and past bookings
- ❌ **Cancel Booking** - Full or partial cancellation with refund calculation

### Technical Features
- 🔄 **7-Day Circular Schedule** - Automatic schedule rotation
- 🔒 **Pessimistic Locking** - Prevent double-booking of seats
- ⚡ **Optimistic Locking** - Handle concurrent updates
- 📊 **Transaction Safety** - All operations are atomic
- 🗃️ **Database Seeding** - Pre-loaded routes, buses, and schedules

## 🛠️ Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.2**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** with Hibernate
- **MySQL 8.0** Database
- **Maven** Build Tool

### Frontend
- **React 18** with Vite
- **React Router Dom** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Icons** for icons
- **Vanilla CSS** with CSS Custom Properties

## 📁 Project Structure

```
Bus_Ticket_Booking/
├── backend/
│   ├── src/main/java/com/busticket/
│   │   ├── BusTicketApplication.java
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA Entities
│   │   ├── exception/       # Custom exceptions
│   │   ├── repository/      # Data access layer
│   │   ├── scheduler/       # Scheduled tasks
│   │   ├── seeder/          # Database seeding
│   │   ├── security/        # JWT & Auth
│   │   └── service/         # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── context/         # React Context (Auth)
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css        # Global styles
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0
- Maven 3.8+

### Backend Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE bus_ticket_booking;
   ```

2. **Configure Database**
   
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/bus_ticket_booking
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Run Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   
   The server starts at `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   The app opens at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | Get all routes |
| GET | `/api/routes/destinations?source=X` | Get destinations from source |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?source=X&destination=Y&date=Z` | Search buses |

### Seats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seats/{scheduleId}` | Get seat layout |
| POST | `/api/seats/lock` | Lock selected seats |
| POST | `/api/seats/release` | Release locked seats |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/create` | Create booking |
| POST | `/api/bookings/confirm-payment` | Confirm payment |
| GET | `/api/bookings/{pnr}` | Get booking by PNR |
| GET | `/api/bookings/my-trips` | Get user's bookings |
| POST | `/api/bookings/cancel` | Cancel booking |

## 💳 Payment Testing

The system uses a dummy payment gateway:
- **Password**: `pay123` → Successful payment
- Any other password → Failed payment

## 🎨 Design System

The app uses a custom CSS design system with:
- **Dark Theme** with purple accent colors
- **Glassmorphism** effects
- **Smooth Animations**
- **Responsive Design**
- **Custom Variables** for easy theming

## 🔒 Security Features

- JWT-based authentication
- Password hashing with BCrypt
- CORS configuration
- Protected routes on frontend
- Request validation

## 📅 Schedule System

- **7-Day Window**: Bookings available for next 7 days
- **Daily Rotation**: New schedules created at midnight
- **Auto Cleanup**: Past schedules marked as completed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ by BusEase Team
