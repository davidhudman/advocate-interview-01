# Express TypeScript API with Frontend

A simple Express.js server built with TypeScript and a frontend to display test results.

## Getting Started

1. Install dependencies:

   ```
   npm run install:all
   ```

2. Set up the database (test is default):

   ```
   NODE_ENV=test npm run setup-db
   ```

   or

   ```
   NODE_ENV=prod npm run setup-db
   ```

3. Start the application (both backend and frontend) (test env is default):

   ```
   NODE_ENV=test npm start
   ```

   or

   ```
   NODE_ENV=prod npm start
   ```

   - Backend will run on: http://localhost:3000
   - Frontend will run on: http://localhost:8080

4. Access the dashboard at http://localhost:8080 (or your configured port)

## Environment Configuration

The application supports two database environments:

- `prod`: Default environment for regular operation
- `test`: Used during test execution

No additional environment variables are required to run the application locally.

## Project Overview

This Express TypeScript API provides a robust foundation for building APIs with TypeScript and Express. The project includes:

- **Express Backend**: Built with TypeScript for type safety
- **Database Integration**: SQLite with Knex.js query builder
- **Testing**: Full Jest test suite with visual test results
- **Frontend Dashboard**: View test results, database data, and API health
- **Mock CRM API**: Simulate a CRM API with OAuth2 authentication
- **Data Synchronization**: Background syncing of users to the CRM API

## Project Structure

- `backend/` - Express.js API with TypeScript
- `frontend/` - Simple UI to display health status and test results

## Database Structure

The application uses SQLite databases:

- **Prod Database**: Main database for application data (`./prod.sqlite3`)
- **Test Database**: Isolated database for running tests (`./test.sqlite3`)

### User Table

The application manages user data with the following fields:

- `id`: UUID primary key
- `name`: User's full name
- `email`: Unique email address
- `phone`: Contact phone number
- `sync_status`: One of 'pending', 'synced', or 'failed'
- `crm_id`: Optional ID for external CRM integration
- `last_updated`: Timestamp of last update

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

### Mock CRM API

- Simulate a CRM system with OAuth2 authentication
- Create and retrieve users in the mock CRM
- Test integration with a third-party system

### Data Synchronization

- Sync users with the CRM system
- Automatically update sync status and store CRM IDs
- Manual sync trigger endpoint

## API Endpoints

### Health Endpoints

- `GET /health` - Returns server health status

### User Endpoints

- `POST /users` - Create a new user

  - Required fields: name, email, phone
  - Validates email format
  - Returns the created user with a 201 status code

- `GET /users/:id` - Get user by ID
  - Returns the user if found with a 200 status code
  - Returns a 404 error if user does not exist

### Mock CRM API Endpoints

- `POST /crm/token` - Generate an OAuth2 token

  - Request body: `{ "client_id": "dummy", "client_secret": "dummy" }`
  - Returns: `{ "access_token": "mock_token", "expires_in": 3600 }`

- `POST /crm/users` - Create a user in the CRM system

  - Requires Authorization header: `Bearer mock_token`
  - Request body: `{ "name": "Jane", "email": "jane@example.com", "phone": "123-456-7890" }`
  - Returns: `{ "crm_id": "CRM123" }`

- `GET /crm/users/:crmId` - Get a user from the CRM system by ID
  - Requires Authorization header: `Bearer mock_token`
  - Returns user details if found
  - Returns 404 if user does not exist

### Sync Endpoints

- `POST /sync` - Manually trigger the synchronization process
  - Fetches all pending users
  - Sends them to the CRM API
  - Updates their sync status based on results
  - Returns counts of successful and failed syncs

### Webhook Endpoint

- `POST /webhook` - Receive updates from the CRM system
  - Accepts JSON payload with format:
    ```json
    {
      "crm_id": "CRM123",
      "updated_fields": {
        "phone": "987-654-3210"
      },
      "timestamp": "2023-10-15T12:00:00Z"
    }
    ```
  - Finds the user with the specified CRM ID
  - Updates the user's fields with the provided values
  - Updates the last_updated timestamp
  - Returns 200 OK on success, 404 Not Found if user doesn't exist

## Testing the Application

1. Open the frontend in your browser: http://localhost:8080
2. Click "Check Health" to verify the backend is working
3. Click "Run Tests" to execute the test suite and see results

## Error Handling and Resilience

This application implements robust error handling and retry mechanisms to ensure reliable operation:

### Retry Logic

- API requests to the CRM system automatically retry up to 3 times with exponential backoff when failures occur
- Initial retry after 1 second, with subsequent retries doubling the wait time
- Complete logging of all retry attempts and their outcomes

### Structured Logging

- Winston-based logging system for all application events
- Detailed contextual information in log entries
- Log levels properly used to categorize information, warnings, and errors
- Logs stored in both combined and error-specific files:
  - `backend/logs/combined.log`: Contains all log entries
  - `backend/logs/error.log`: Contains only error-level entries

### Error Responses

- Meaningful error messages returned to clients
- Appropriate HTTP status codes used for different error scenarios
- Detailed error logging for debugging purposes

## Using the API

Here are some examples of how to interact with the API using curl:

### Health Check

```bash
curl http://localhost:3000/health
```

### User Management

Create a timestamp variable to make emails unique:

```bash
TIMESTAMP=$(date +%s)
```

Create a new user with timestamp in email:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"John Doe\", \"email\": \"john-${TIMESTAMP}@example.com\", \"phone\": \"123-456-7890\"}"
```

or if you want to set the USER_ID variable

```bash
USER_ID=$(curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"John Doe\", \"email\": \"john-${TIMESTAMP}@example.com\", \"phone\": \"123-456-7890\"}" | jq -r '.id')

echo "USER_ID: $USER_ID"
```

Get a user by ID (replace USER_ID with an actual uuid if not set):

```bash
curl http://localhost:3000/users/$USER_ID
```

### Mock CRM API

Generate an OAuth2 token:

```bash
TOKEN=$(curl -X POST http://localhost:3000/crm/token -H "Content-Type: application/json" -d '{"client_id": "dummy", "client_secret": "dummy"}' | jq -r '.access_token')

echo "TOKEN: $TOKEN"
```

Create a user in the CRM system (using the token in the previous step and a timestamp variable to make emails unique)

```bash
TIMESTAMP=$(date +%s)
CRM_ID=$(curl -X POST http://localhost:3000/crm/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Jane\", \"email\": \"jane-${TIMESTAMP}@example.com\", \"phone\": \"987-654-3210\"}" \
  | jq -r '.crm_id')

echo "CRM_ID: $CRM_ID"
```

Get a user from the CRM system by ID:

```bash
curl http://localhost:3000/crm/users/$CRM_ID -H "Authorization: Bearer $TOKEN"
```

### Sync Endpoints

Trigger a manual sync of pending users to CRM:

```bash
curl -X POST http://localhost:3000/sync
```

Send webhook update from CRM:

```bash
# 1. Create a user in your main system first
TIMESTAMP=$(date +%s)
USER_ID=$(curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"John Doe\", \"email\": \"john-${TIMESTAMP}@example.com\", \"phone\": \"123-456-7890\"}" \
  | jq -r '.id')

echo "USER_ID: $USER_ID"

# 2. Sync this user to the CRM system
curl -X POST http://localhost:3000/sync

# 3. Now you can update this user via webhook (get the CRM_ID first)
CRM_ID=$(curl http://localhost:3000/users/$USER_ID | jq -r '.crm_id')
echo "CRM_ID: $CRM_ID"

# 4. Send the webhook update
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d "{\"crm_id\": \"$CRM_ID\", \"updated_fields\": {\"phone\": \"555-123-4567\"}, \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"
```
