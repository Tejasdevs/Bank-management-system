# Bank Management System - Backend

## Features
- User authentication (JWT)
- Account management
- Transactions (deposit, withdraw, transfer)
- Audit logging
- Rate limiting
- Database transactions for consistency
- Interest calculation job (cron)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Start MySQL (or use Docker):
```bash
docker-compose up -d db
```

4. Seed the database:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login

### Accounts
- GET `/api/accounts/user` - Get user's accounts
- POST `/api/accounts` - Create account
- GET `/api/accounts/:id` - Get account details
- GET `/api/accounts/:accountId/transactions` - Get account transactions
- PATCH `/api/accounts/:id/freeze` - Freeze account (admin only)

### Transactions
- POST `/api/transactions/deposit` - Deposit money
- POST `/api/transactions/withdraw` - Withdraw money
- POST `/api/transactions/transfer` - Transfer between accounts

## Test Credentials
- Alice: alice@bank.com / Alice123!
- Bob: bob@bank.com / Bob123!
- Admin: admin@bank.com / Admin123!
