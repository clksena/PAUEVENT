# Event App Backend

## Installation

```bash
npm install
```

## Setup

1. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_NAME=eventapp
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=24h
   PORT=3000
   ```
2. Update database credentials
3. Ensure MySQL is running and create the database:
   ```sql
   CREATE DATABASE eventapp;
   ```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

