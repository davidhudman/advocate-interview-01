# Step 5: Implement Data Sync to CRM

## Objective

Send pending users to the CRM API and update their sync status.

## Requirements

### Backend Implementation

Modify the Express.js backend to include:

1. A background sync function that:

   - Fetches users with sync_status = "pending" from the database
   - Requests an OAuth2 token from POST /crm/token
   - Sends each user to POST /crm/users with the OAuth2 token
   - If successful:
     - Updates the user's sync_status = "synced" and stores the returned crm_id
   - If failed:
     - Updates the user's sync_status = "failed"

2. A manual sync endpoint:
   - POST /sync: Triggers the sync function manually

### Test Configuration

1. Create a testSettings.ts file to control test data persistence:

   - Add a persistTestData flag that can be toggled to true/false
   - When true, test data will remain in the database after tests
   - When false, test data will be cleaned up after each test

2. Modify test files to respect this setting:
   - Update sync.test.ts, users.test.ts, db.test.ts and crm.test.ts
   - Add conditional cleanup based on the persistTestData flag
   - Enable database inspection capabilities for debugging

### Automated Tests

Write Jest tests to verify:

1. A user with sync_status = "pending" is sent to the CRM API when /sync is called
2. If the CRM API returns success, sync_status updates to "synced" and the crm_id is stored
3. If the CRM API fails, sync_status updates to "failed"
4. If the OAuth token request fails, the sync process does not proceed

### Documentation

1. Update the README with details on:
   - The new sync functionality
   - The API endpoints
   - Test configuration options

### Dependencies

1. Add axios for making HTTP requests to the CRM API

## Expected Deliverables

1. Backend controller for sync functionality
2. Sync route implementation
3. Test settings configuration
4. Comprehensive test coverage
5. Updated documentation
