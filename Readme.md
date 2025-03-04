# Express TypeScript API with Frontend

A simple Express.js server built with TypeScript and a frontend to display test results.

## Project Overview

This Express TypeScript API provides a robust foundation for building APIs with TypeScript and Express. The project includes:

- **Express Backend**: Built with TypeScript for type safety
- **Database Integration**: SQLite with Knex.js query builder
- **Testing**: Full Jest test suite with visual test results
- **Frontend Dashboard**: View test results, database data, and API health

## Project Structure

- `backend/` - Express.js API with TypeScript
- `frontend/` - Simple UI to display health status and test results

## Database Structure

The application uses SQLite databases:

- **Prod Database**: Main database for application data (`./prod.sqlite3`)
- **Test Database**: Isolated database for running tests (`./test.sqlite3`)

## Features

### Database Viewer

The application includes a built-in database viewer that allows you to:

- View schema definitions for all tables
- Browse records in both prod and test databases
- Toggle between different database environments

### Testing Dashboard

- Run tests directly from the UI
- Filter test results by status or search term
- View detailed test reports

### Health Check

- Monitor API health status
- Quick health verification

## Getting Started

1. Install dependencies:

   ```
   npm run install:all
   ```

2. Set up the database:

   ```
   cd backend && npm run setup-db
   ```

3. Start the application (both backend and frontend):

   ```
   npm start
   ```

   - Backend will run on: http://localhost:3000
   - Frontend will run on: http://localhost:8080

4. Access the dashboard at http://localhost:8080 (or your configured port)

## Environment Configuration

The application supports two database environments:

- `prod`: Default environment for regular operation
- `test`: Used during test execution

No additional environment variables are required to run the application locally.

## Endpoints

- `GET /health` - Returns server health status

## Testing the Application

1. Open the frontend in your browser: http://localhost:8080
2. Click "Check Health" to verify the backend is working
3. Click "Run Tests" to execute the test suite and see results
