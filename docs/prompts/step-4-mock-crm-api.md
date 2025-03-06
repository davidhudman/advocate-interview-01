# Step 4: Build the Mock CRM API with OAuth2 Token

## Objective

Simulate a CRM API that requires an OAuth2 token for authentication.

## Requirements

Create a mock CRM API using Express.js that includes:

- **POST /crm/token**:

  - Accepts `{ "client_id": "dummy", "client_secret": "dummy" }`
  - Returns `{ "access_token": "mock_token", "expires_in": 3600 }`

- **POST /crm/users**:

  - Requires an `Authorization: Bearer mock_token` header
  - Accepts `{ "name": "Jane", "email": "jane@example.com", "phone": "123-456-7890" }`
  - Returns `{ "crm_id": "CRM123" }`

- **GET /crm/users/:crm_id**:
  - Requires an `Authorization: Bearer mock_token` header
  - Returns user details if found
  - Returns 404 Not Found if crm_id doesn't exist

## Testing Requirements

- POST /crm/token returns a valid access token
- POST /crm/users with a valid token returns a crm_id
- POST /crm/users without a token returns 401 Unauthorized
- GET /crm/users/:crm_id with a valid token returns user details
- GET /crm/users/:crm_id without a token returns 401 Unauthorized
- GET /crm/users/:crm_id for a non-existent ID returns 404 Not Found
