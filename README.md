# Bank Management System (BMS)

A full-stack Bank Management System built with Node.js, Express, MySQL, and React.

## Features

### Backend
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Account Management**: Create, view, and manage bank accounts
- **Transactions**: Deposit, withdraw, and transfer with database transaction safety
- **Audit Logging**: Complete audit trail for all operations
- **Security**: Rate limiting, helmet.js, bcrypt password hashing
- **Scheduled Jobs**: Automated interest calculation using node-cron

### Frontend
- **Modern UI**: Clean, responsive design with gradient cards
- **Dashboard**: Real-time account balance and transaction history
- **Operations**: Easy-to-use forms for deposits, withdrawals, and transfers
- **React Router**: Smooth navigation between pages

## Tech Stack

### Backend
- Node.js & Express
- MySQL with Sequelize ORM
- JWT for authentication
- bcryptjs for password hashing
- express-rate-limit for API protection
- node-cron for scheduled tasks

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Vite for fast development
- Modern CSS with gradients and shadows

## Project Structure

```
mini project/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Auth, error handling, rate limiting
│   │   ├── utils/          # Helper functions
│   │   ├── jobs/           # Cron jobs
│   │   ├── seed/           # Database seeding
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── tests/              # Test files
│   ├── package.json
│   ├── .env.example
│   └── docker-compose.yml
│
└── frontend/
    ├── src/
    │   ├── api/            # API client
    │   ├── pages/          # React pages
    │   ├── styles/         # CSS files
    │   ├── App.jsx         # Main app component
    │   └── index.jsx       # Entry point
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bms
DB_USER=root
DB_PASS=your_password
BCRYPT_SALT=10
```

4. Create the database:
```sql
CREATE DATABASE bms;
```

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Accounts
- `GET /api/accounts/user` - Get logged-in user's accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get account details
- `GET /api/accounts/:accountId/transactions` - Get account transactions
- `PATCH /api/accounts/:id/freeze` - Freeze account (admin only)

### Transactions
- `POST /api/transactions/deposit` - Deposit money
- `POST /api/transactions/withdraw` - Withdraw money
- `POST /api/transactions/transfer` - Transfer between accounts

## Test Credentials

After seeding the database:

- **Alice** (Customer)
  - Email: alice@bank.com
  - Password: Alice123!
  - Account Balance: ₹50,000

- **Bob** (Customer)
  - Email: bob@bank.com
  - Password: Bob123!
  - Account Balance: ₹7,500

- **Admin**
  - Email: admin@bank.com
  - Password: Admin123!

## Docker Support

You can run the entire stack using Docker:

```bash
cd backend
docker-compose up
```

This will start:
- MySQL database on port 3306
- Backend API on port 5000

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (60 requests per minute)
- Helmet.js for HTTP headers security
- CORS configuration
- Database transaction locking for concurrent operations

## Database Schema

### Users
- id, name, email, passwordHash, role, isActive

### Accounts
- id, accountNumber, userId, accountType, currency, balance, status

### Transactions
- id, accountId, type, amount, currency, relatedAccountId, balanceAfter, narration

### Audits
- id, entity, entityId, action, dataBefore, dataAfter, performedBy

### Loans
- id, accountId, principal, rate, tenureMonths, outstanding, status

## Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Future Enhancements

- [ ] Loan management system
- [ ] Admin dashboard
- [ ] Account statements (PDF generation)
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Transaction search and filters
- [ ] Charts and analytics
- [ ] Mobile app

## License

MIT

## Contributors

Tejas - Full Stack Developer
