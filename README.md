# 💰 CoinKeeper

> Smart expense tracking and budgeting application built with microservices architecture

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.19-brightgreen.svg)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

## 🌟 Overview

CoinKeeper is a modern expense tracking and budgeting application designed specifically for students and budget-conscious individuals. Built with a microservices architecture, it provides a scalable and maintainable solution for managing personal finances.

## ✨ Features

### 💳 Expense Management
- **Track Expenses**: Add, view, and delete expenses with detailed categorization
- **Calendar View**: Visualize expenses on an interactive calendar
- **Real-time Updates**: Instant reflection of changes across the application

### 📊 Budget Control
- **Category Budgets**: Set spending limits for different categories (Rent, Food, Transport, etc.)
- **Smart Alerts**: Real-time notifications when approaching or exceeding budget limits
- **Visual Indicators**: Color-coded progress bars and percentage indicators

### 📈 Analytics & Insights
- **Spending Trends**: Track spending patterns over 12 weeks with line charts
- **Category Breakdown**: Pie charts showing distribution across categories
- **Budget vs Actual**: Compare budgeted amounts with actual spending

### 📑 Reporting
- **Monthly Reports**: Comprehensive spending reports by month
- **CSV Export**: Download expense data for external analysis
- **Detailed Breakdowns**: Category-wise spending summaries

### 🔐 Security
- **JWT Authentication**: Secure user authentication and authorization
- **Password Encryption**: Bcrypt hashing for password security
- **Protected Routes**: Role-based access control

## 🏗️ Architecture

CoinKeeper follows a **microservices architecture** with four independent backend services:

```
┌─────────────────┐
│   Frontend      │
│  (React SPA)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Nginx  │
    └────┬────┘
         │
    ┌────┴────────┐──────────────┐──────────────┐
    │             │              │              │
┌───┴────┐  ┌──────────┐  ┌──────┴─────┐  ┌─────────────┐
│ Auth   │  │ Expenses │  │  Budgets   │  │  Analytics  │
│Service │  │ Service  │  │  Service   │  │   Service   │
└───┬────┘  └────┬─────┘  └─────┬──────┘  └──────┬──────┘
    │            │              │                │
    └────────────┘──────────────┘────────────────┘
                        │
                   ┌────┴─────┐
                   │ MongoDB  │
                   └──────────┘
```

### Service Breakdown

| Service | Port | Description |
|---------|------|-------------|
| **Auth Service** | 5002 | User authentication and authorization |
| **Expenses Service** | 5003 | CRUD operations for expenses |
| **Budgets Service** | 5004 | Budget management and alerts |
| **Analytics Service** | 5005 | Data analysis and reporting |
| **Frontend** | 3000/80 | React SPA served via Nginx |

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **React Router 7.9** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Recharts 3.3** - Data visualization
- **React Big Calendar 1.19** - Calendar component
- **Framer Motion 12.23** - Animation library
- **Axios 1.12** - HTTP client

### Backend
- **Node.js 22** - Runtime environment
- **Express 5.1** - Web framework
- **MongoDB 8.19** - NoSQL database
- **Mongoose 8.19** - ODM library
- **JWT 9.0** - Authentication tokens
- **Bcrypt.js 3.0** - Password hashing

### DevOps & CI/CD
- **Docker** - Containerization
- **Jenkins** - CI/CD pipeline
- **Kubernetes** - Container orchestration
- **Nginx** - Reverse proxy and static file serving

## 🚀 Getting Started

### Prerequisites

- Node.js 22 or higher
- MongoDB 8.0 or higher
- Docker & Docker Compose (optional)
- npm or yarn

### Environment Variables

Create `.env` files in each service directory:

```bash
# Backend services (auth-service, expenses-service, budgets-service, analytics-service)
MONGODB_URI=mongodb://localhost:27017/coinkeeper
JWT_SECRET=your_jwt_secret_key_here
PORT=500X  # Specific port for each service
```

### Installation & Running Locally

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/coinkeeper.git
cd coinkeeper
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

3. **Install and run each backend service**
```bash
# Auth Service
cd services/auth-service
npm install
npm run dev  # Runs on http://localhost:5002

# Expenses Service
cd services/expenses-service
npm install
npm run dev  # Runs on http://localhost:5003

# Budgets Service
cd services/budgets-service
npm install
npm run dev  # Runs on http://localhost:5004

# Analytics Service
cd services/analytics-service
npm install
npm run dev  # Runs on http://localhost:5005
```

### Docker Deployment

Run the entire application with Docker Compose:

```bash
docker-compose up --build
```

## 📁 Project Structure

```
coinkeeper/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React context providers
│   │   ├── pages/          # Page components
│   │   └── api.js          # Axios configuration
│   ├── Dockerfile
│   └── nginx.conf          # Nginx configuration
│
├── services/
│   ├── auth-service/       # Authentication microservice
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   │
│   ├── expenses-service/   # Expense management microservice
│   ├── budgets-service/    # Budget management microservice
│   └── analytics-service/  # Analytics microservice
│
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── auth.yaml
│   ├── expenses.yaml
│   ├── budgets.yaml
│   ├── analytics.yaml
│   ├── frontend.yaml
│   └── ingress.yaml
│
├── Jenkinsfile            # CI/CD pipeline configuration
└── README.md
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses (`/api/expenses`)
- `GET /api/expenses` - Get all expenses (protected)
- `POST /api/expenses` - Create expense (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)

### Budgets (`/api/budgets`)
- `GET /api/budgets` - Get all budgets (protected)
- `POST /api/budgets` - Create budget (protected)
- `GET /api/budgets/alerts` - Get budget alerts (protected)
- `DELETE /api/budgets/:id` - Delete budget (protected)

### Analytics (`/api/analytics`)
- `GET /api/analytics/trends` - Get spending trends (protected)
- `GET /api/analytics/categories` - Get category breakdown (protected)
- `GET /api/analytics/budget-comparison` - Compare budget vs actual (protected)

## 🚢 Deployment

### Jenkins CI/CD Pipeline

The project includes a complete Jenkins pipeline that:
1. Checks out code from repository
2. Builds frontend and all backend services
3. Runs unit tests (configurable)
4. Performs SonarQube analysis
5. Builds Docker images
6. Deploys containers to production

### Kubernetes Deployment

Deploy to Kubernetes cluster:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

Access the application via Ingress:
```
http://coinkeeper.local
```

## 📸 Screenshots

> Add screenshots of your application here

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ziad Abillama** - [GitHub Profile](https://github.com/yourusername)
- **Hamed Bou Saleh** - Contributor
- **William Nader** - Contributor

## 🙏 Acknowledgments

- Inspiration from modern fintech applications
- Built as a learning project for microservices architecture
- Thanks to all contributors and testers

---

<p align="center">Made by the CoinKeeper Team</p>
