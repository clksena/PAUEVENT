# Event Registration Web Application

A complete full-stack event registration system built with NestJS (backend) and React (frontend).

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **Role-Based Access Control**: ADMIN and USER roles with different permissions
- **Event Management**: ADMIN users can create, update, and delete events
- **Event Registration**: Users can register for events and cancel registrations
- **Participant Management**: ADMIN users can view registered participants for their events

## Tech Stack

### Backend
- NestJS
- TypeORM
- MySQL
- JWT Authentication
- Passport.js

### Frontend
- React
- React Router
- Axios
- CSS3

## Project Structure

```
eventapp/
├── backend/          # NestJS backend application
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── events/   # Event management
│   │   ├── registrations/  # Event registration
│   │   └── roles/    # Role management
│   └── package.json
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── contexts/ # React contexts
│   │   └── services/ # API services
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=eventapp
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=3000
```

4. Create the MySQL database:
```sql
CREATE DATABASE eventapp;
```

5. Start the backend server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3001`

## Usage

1. **Register a new user**: Navigate to the register page and create an account
2. **Login**: Use your credentials to log in
3. **Assign ADMIN role** (optional): To create events, a user needs the ADMIN role. You can assign it via the API:
   ```bash
   PATCH /users/:userId/assign-role
   Body: { "roleName": "ADMIN" }
   ```
   (Requires authentication with an existing ADMIN user)

4. **ADMIN Features**:
   - Create, edit, and delete events
   - View registered participants for events

5. **USER Features**:
   - View all available events
   - Register for events
   - Cancel event registrations

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users
- `GET /users/profile` - Get current user profile (authenticated)
- `PATCH /users/:id/assign-role` - Assign role to user (ADMIN only)

### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get event details
- `POST /events` - Create event (ADMIN only)
- `PATCH /events/:id` - Update event (ADMIN only)
- `DELETE /events/:id` - Delete event (ADMIN only)

### Registrations
- `POST /registrations/events/:eventId` - Register for event (authenticated)
- `DELETE /registrations/events/:eventId` - Cancel registration (authenticated)
- `GET /registrations/my-registrations` - Get user's registrations (authenticated)
- `GET /registrations/events/:eventId/participants` - Get event participants (ADMIN only)

## Database Schema

- **User**: id, email, password, firstName, lastName
- **Role**: id, name
- **Event**: id, title, description, location, date, maxParticipants, createdById
- **EventRegistration**: id, userId, eventId, registeredAt

## Relationships

- User ↔ Role: Many-to-Many
- User ↔ Event: Many-to-Many (through EventRegistration)
- User → Event: One-to-Many (createdBy relationship)

