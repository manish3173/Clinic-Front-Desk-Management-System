# Clinic-Front-Desk-Management-System


A modern, full-stack web application designed to streamline clinic operations through efficient patient queue management and appointment scheduling.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login system
- 👥 **Patient Management** - Complete patient records and medical history
- 👨‍⚕️ **Doctor Management** - Doctor profiles with specializations and availability
- 📅 **Appointment Scheduling** - Smart booking with conflict detection
- 🚶‍♂️ **Queue Management** - Real-time patient queue with priority system
- 📊 **Dashboard** - Live statistics and today's overview

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **React Hooks** - State management

### Backend

- **NestJS** - Scalable Node.js framework
- **TypeORM** - Database ORM
- **MySQL** - Relational database
- **JWT** - Authentication & authorization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/manish3173/Clinic-Front-Desk-Management-System.git
cd Clinic-Front-Desk-Management-System
```

2. **Install dependencies**

```bash
npm install
cd backend && npm install
npm install --save-dev @nestjs/cli --force

cd ../frontend && npm install
```

3. **Setup Database**

```bash
# Create MySQL database
CREATE DATABASE clinic_management;
```

4. **Configure Environment**

```bash
# Backend (.env)
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clinic_management
JWT_SECRET=your_jwt_secret_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

5. **Start the Application**

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

6. **Access the Application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Login

- **Username:** admin
- **Password:** admin123


## 🎯 Key Functionality

### Dashboard

- Real-time queue statistics
- Today's appointments overview
- Quick navigation to all modules

### Patient Management

- Add new patient records
- Search and filter patients
- Complete medical history
- Contact information management

### Doctor Management

- Doctor profile creation
- Specialization and availability
- Schedule management
- Search by location/specialty

### Appointment System

- Book new appointments
- Conflict detection
- Status tracking (booked → confirmed → completed)
- Automatic scheduling validation

### Queue Management

- Add walk-in patients to queue
- Priority-based queue system
- Real-time status updates
- Call next patient functionality

## 🔧 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - Register new user

### Patients

- `GET /patients` - Get all patients
- `POST /patients` - Create new patient
- `PATCH /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Doctors

- `GET /doctors` - Get all doctors
- `POST /doctors` - Create new doctor
- `GET /doctors/search` - Search doctors

### Appointments

- `GET /appointments` - Get all appointments
- `POST /appointments` - Create appointment
- `PATCH /appointments/:id` - Update appointment

### Queue

- `GET /queue` - Get queue items
- `POST /queue` - Add to queue
- `PATCH /queue/:id/status` - Update status

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙋‍♂️ Support

If you have any questions or run into issues, please create an issue in this repository.

## ⭐ Give it a Star!

If this project helped you, please give it a ⭐ on GitHub!

