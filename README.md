# Chit Fund Manager

A complete chit fund management system built with Flask backend and Next.js frontend, using SQLite database.

## Features

### Admin Features
- **Group Management**: Create and manage chit groups with customizable terms
- **Member Management**: Add and manage group members
- **Payment Tracking**: Monitor member payments and installments
- **Dashboard Analytics**: Overview of all groups and their status
- **Financial Reports**: Track group finances and member contributions

### Member Features
- **Personal Dashboard**: View all joined chit groups
- **Group Discovery**: Browse available chit groups
- **Payment History**: Track your payment records and status
- **Group Details**: Monitor group progress and member information

## Tech Stack

### Backend
- **Flask**: Python web framework
- **SQLite**: Lightweight database with `chitfund.db` file
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls

## Database Schema

### Tables
1. **users**: User accounts (admin/member roles)
2. **chitgroups**: Chit fund group details
3. **groupmembers**: Junction table linking users to groups


## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### Getting Started
1. Open `http://localhost:3000` in your browser
2. Register as either an Admin or Member
3. Login with your credentials

### For Admins
1. Create chit groups from the admin dashboard
2. Set group parameters (value, members, duration, commission)
3. Add members to groups and manage their participation
4. Track member participation and payments

### For Members
1. Browse available chit groups
2. Join groups by selecting available ticket numbers
3. View your dashboard to track all participations
4. Monitor payment schedules and group progress

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chit Groups
- `GET /api/chitgroups` - Get all chit groups
- `POST /api/chitgroups` - Create new chit group (admin only)
- `GET /api/chitgroups/{id}/members` - Get group members
- `POST /api/chitgroups/{id}/join` - Join a group



### Member Dashboard
- `GET /api/member/dashboard` - Get member's groups and data

## Database File

The SQLite database file `chitfund.db` will be automatically created in the backend directory when you first run the Flask application. The database includes:

- Proper foreign key relationships
- Unique constraints for data integrity
- Automatic timestamp tracking
- Role-based access control

## Key Concepts

### Chit Fund Basics
- **Chit Value**: Total amount of the chit fund
- **Installment**: Monthly payment by each member
- **Payment Schedule**: Monthly installment tracking for each member
- **Group Status**: Current state of the chit fund (Pending, Active, Completed)

### Calculation Example
- Chit Value: ₹2,00,000
- Members: 20
- Monthly Installment: ₹10,000 per member
- Total Monthly Collection: ₹2,00,000
- Duration: 20 months

## Development

### Adding New Features
1. Backend: Add routes in `app.py` and update database schema if needed
2. Frontend: Create new pages in `app/` directory and API calls in `lib/api.ts`

### Database Migrations
Since we're using SQLite with manual schema creation, any schema changes should be made in the `init_db()` function in `app.py`.

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - see LICENSE file for details.