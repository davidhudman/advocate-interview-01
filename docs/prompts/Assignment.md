# Coding Challenge for Integrations Engineer

## Synchronize User Data with a Simulated CRM API

### Objective

Develop a local backend application that synchronizes user data between a local system and a simulated Customer Relationship Management (CRM) API. This challenge tests your ability to design and implement a robust integration solution involving RESTful APIs, authentication, data synchronization, error handling, and asynchronous updates—core competencies for an Integrations Engineer.

### Requirements

#### 1. Backend Application

**API Setup:** Create a RESTful API with the following endpoints:

- **POST /users:** Accept user data in JSON format.

  Payload example:

  ```json
  {
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "123-456-7890"
  }
  ```

- **GET /users/<id>:** Retrieve the status and details of a specific user by their local ID.

Validate incoming data (e.g., ensure email is in a valid format and required fields are present).

Store user data in a local database (e.g., SQLite or PostgreSQL) with fields for:

- Local ID (unique identifier, e.g., UUID).
- User details (name, email, phone).
- Sync status (pending, synced, failed).
- CRM ID (assigned by the mock CRM API after successful sync).
- Last updated timestamp.

#### 2. Simulated CRM API

Set up a mock CRM API (using tools like Postman Mock Server, json-server, or a basic Express.js app) with:

- **POST /crm/users:** Accept user data and return a response with a CRM-generated ID (e.g., `crm_id: "CRM123"`) or an error (e.g., 400 for invalid data).
- **GET /crm/users/<crm_id>:** Return the latest user data for a given CRM ID, simulating updates made in the CRM.

Secure the mock CRM API with OAuth 2.0 (simplified). Include a mock `/crm/token` endpoint that returns a static access token when provided with dummy client credentials. Require the access token in the Authorization header for all CRM API requests.

#### 3. Data Synchronization

**Initial Sync:**

- After receiving user data via `/users`, validate it and store it in the database with a pending status.
- Send the data to the mock CRM API’s `/crm/users` endpoint using the OAuth token.
- Update the database with the CRM ID and change the status to synced on success, or failed on error (with an error message logged).

**Conflict Handling:**

- Simulate a scenario where the CRM modifies user data (e.g., phone number changes).
- Add a mechanism to fetch updated data from the CRM API (via `/crm/users/<crm_id>`) and reconcile differences with the local database, prioritizing CRM data as the source of truth.

#### 4. Asynchronous Updates via Webhook

Implement a `POST /webhook` endpoint in the backend to receive updates from the mock CRM API when user data changes (e.g., phone number updated in the CRM).

Payload Example:

```json
{
  "crm_id": "CRM123",
  "updated_fields": {
    "phone": "987-654-3210"
  },
  "timestamp": "2023-10-15T12:00:00Z"
}
```

## Update the Corresponding User Record

Update the corresponding user record in the local database with the new data and timestamp, ensuring consistency between systems.

## Error Handling and Resilience

Implement a basic retry mechanism (e.g., 3 attempts with exponential backoff) for failed requests to the CRM API.

Log all sync attempts, errors, and webhook events to a file or console for debugging.

## Optional Enhancements

If time permits, consider implementing the following optional enhancements:

- Allow updates from the local system (via a `PUT /users/<id>` endpoint) to propagate back to the CRM API.
- Send an email or log a message when a sync fails after all retries.
- Simulate CRM API rate limits and handle them gracefully in the backend.

## Deliverables

### Source Code

Provide complete source code for the backend application and mock CRM API.

### Setup Instructions

Include detailed steps to:

- Install dependencies.
- Set up the database and mock server.
- Run both components and simulate webhook calls (e.g., using curl or Postman).

### Documentation

Submit concise documentation covering:

- Your approach and key design decisions (e.g., why you chose a specific retry strategy).
- A simple diagram or explanation of how data flows between components.
- Any challenges encountered and solutions implemented.

## Evaluation Criteria

- **Functionality:** Correct implementation of API endpoints, data sync, webhook handling, and OAuth authentication.
- **Data Consistency:** Effective synchronization and conflict resolution between local and CRM data.
- **Robustness:** Proper error handling, retry logic, and logging.
- **Security:** Secure handling of authentication tokens and API interactions.
- **Code Quality:** Clean, modular code adhering to best practices (e.g., separation of concerns, meaningful variable names).
- **Bonus Features:** Implementation of optional enhancements like bidirectional sync or notifications.

## Notes

- **Time Estimate:** Approximately 4 hours.
- Clearly document any simplifications or assumptions.
