# Express TypeScript API with Frontend

A simple Express.js server built with TypeScript and a frontend to display test results.

## Project Structure

- `backend/` - Express.js API with TypeScript
- `frontend/` - Simple UI to display health status and test results

## Getting Started

1. Install all dependencies:
   ```
   npm run install:all
   ```

2. Start both backend and frontend:
   ```
   npm start
   ```

   - Backend will run on: http://localhost:3000
   - Frontend will run on: http://localhost:8080

3. Run tests:
   ```
   npm test
   ```

## Endpoints

- `GET /health` - Returns server health status

## Testing the Application

1. Open the frontend in your browser: http://localhost:8080
2. Click "Check Health" to verify the backend is working
3. Click "Run Tests" to execute the test suite and see results
