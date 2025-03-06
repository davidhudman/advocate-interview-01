# Step 6: Implement Webhook Handling (Receiving Updates from the CRM API)

## Objective

Create a webhook to receive updates from the CRM and update the local database accordingly.

## Implementation

1. Created a new endpoint: `POST /webhook`
2. Implemented validation for webhook payloads
3. Added handling to find users by CRM ID and update with incoming data
4. Stored timestamps of updates
5. Added comprehensive tests for webhook functionality

## Technical Details

- Used Joi for validating webhook payloads
- Updated users based on their CRM ID
- Recorded timestamp of updates in the last_updated field
- Properly handled edge cases (invalid requests, non-existent CRM IDs)

## Testing

Tests verify:

- Successful updates via webhook
- Handling of non-existent CRM IDs
- Validation of required fields in webhook payloads
