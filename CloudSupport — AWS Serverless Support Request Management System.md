# CloudSupport — AWS Serverless Support Request Management System

CloudSupport is a serverless support request management system built on AWS. It allows users to submit support requests through a web interface and track previously submitted requests using a unique request ID.

The project demonstrates an end-to-end serverless workflow using Amazon S3, API Gateway, AWS Lambda, DynamoDB, IAM, and CloudWatch.

## Architecture

```text
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Amazon S3         │
                         │ Static Frontend     │
                         └──────────┬──────────┘
                                    │
                           HTTPS API Requests
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   API Gateway       │
                         │    HTTP API         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    AWS Lambda       │
                         │ Business Logic      │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │     DynamoDB        │
                         │ Support Requests    │
                         └─────────────────────┘

                         Lambda Execution Logs
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    CloudWatch       │
                         │       Logs          │
                         └─────────────────────┘
```

## Features

- Submit a customer support request
- Request validation on frontend and backend
- Automatic unique request ID generation
- Store support requests in DynamoDB
- Retrieve requests using a request ID
- Request status tracking
- Category and priority selection
- Error handling for invalid requests
- Responsive web interface
- API-based serverless architecture
- IAM least-privilege access
- CloudWatch logging
- No EC2 server management required

## AWS Services Used

| AWS Service | Purpose |
|---|---|
| Amazon S3 | Hosts the static frontend |
| API Gateway | Provides HTTP API endpoints |
| AWS Lambda | Handles validation and business logic |
| Amazon DynamoDB | Stores support request data |
| AWS IAM | Controls Lambda permissions |
| Amazon CloudWatch | Stores Lambda execution logs |

## Application Workflow

### 1. Submit a Support Request

The user fills out the support form with:

- Name
- Email
- Category
- Priority
- Description

The frontend sends the request to:

```text
POST /requests
```

API Gateway forwards the request to Lambda.

Lambda:

1. Parses the request
2. Validates the input
3. Generates a unique request ID
4. Adds the request status as `Open`
5. Stores the record in DynamoDB
6. Returns the request ID to the frontend

Example response:

```json
{
  "message": "Support request created successfully.",
  "requestId": "CS-20260913-14F64"
}
```

### 2. Track a Support Request

The user enters the request ID into the tracking section.

The frontend sends:

```text
GET /requests/{requestId}
```

Lambda retrieves the corresponding record from DynamoDB and returns the stored information.

Example:

```json
{
  "requestId": "CS-20260913-14F64",
  "name": "Amarjit",
  "email": "amarjit@example.com",
  "category": "Technical Issue",
  "priority": "High",
  "description": "Testing the CloudSupport API through API Gateway.",
  "status": "Open",
  "createdAt": "2026-09-13T07:00:04.108537+00:00"
}
```

## API Endpoints

### Create Support Request

```text
POST /requests
```

Request body:

```json
{
  "name": "Amarjit",
  "email": "amarjit@example.com",
  "category": "Technical Issue",
  "priority": "High",
  "description": "Unable to access my account."
}
```

Successful response:

```json
{
  "message": "Support request created successfully.",
  "requestId": "CS-20260913-XXXXX"
}
```

### Get Support Request

```text
GET /requests/{requestId}
```

Example:

```text
GET /requests/CS-20260913-XXXXX
```

## Validation

The application performs validation before storing data.

### Name

- Required
- Minimum 2 characters
- Maximum 50 characters

### Email

- Required
- Must follow a valid email format

### Category

Allowed values:

```text
Technical Issue
Billing
Account
General
```

### Priority

Allowed values:

```text
Low
Medium
High
```

### Description

- Required
- Minimum 10 characters
- Maximum 1000 characters

Validation is performed both on the frontend and inside Lambda so that the backend does not blindly trust client input.

## Error Handling

The API returns appropriate HTTP status codes.

| Status | Meaning |
|---|---|
| 201 | Support request successfully created |
| 400 | Invalid request or validation failure |
| 404 | Support request not found |
| 405 | HTTP method not allowed |
| 500 | Internal server error |

Examples of handled errors:

```text
Request body is required.
Invalid JSON format.
Please provide a valid email address.
Invalid category.
Invalid priority.
Description must be between 10 and 1000 characters.
Request ID is required.
Support request not found.
```

## DynamoDB Design

Table:

```text
CloudSupportRequests
```

Primary key:

```text
requestId
```

Example item:

```json
{
  "requestId": "CS-20260913-14F64",
  "name": "Amarjit",
  "email": "amarjit@example.com",
  "category": "Technical Issue",
  "priority": "High",
  "description": "Unable to access my account.",
  "status": "Open",
  "createdAt": "2026-09-13T07:00:04.108537+00:00"
}
```

DynamoDB was selected because the application requires simple key-based creation and retrieval of support requests without the overhead of managing a relational database server.

## IAM Security

The Lambda execution role follows the principle of least privilege.

The custom DynamoDB policy grants only:

```text
dynamodb:PutItem
dynamodb:GetItem
```

and limits access to the `CloudSupportRequests` table.

The Lambda function does not have unnecessary permissions such as:

```text
dynamodb:*
dynamodb:DeleteTable
dynamodb:Scan
```

Lambda also uses the standard AWS-managed execution policy required for CloudWatch logging.

## Monitoring

AWS CloudWatch is used to monitor Lambda executions.

CloudWatch provides:

- Lambda execution logs
- Error information
- Debugging information
- Execution history

This makes it possible to investigate failures without accessing or managing a server.

## CORS

API Gateway is configured to allow the frontend to communicate with the API.

Current development configuration:

```text
Allowed Origin: *
Allowed Methods: GET, POST
Allowed Headers: Content-Type
Credentials: No
```

For a production deployment, the allowed origin should be restricted to the specific frontend domain rather than allowing all origins.

## Security Considerations

The project follows several basic cloud security practices:

- IAM least privilege
- No AWS credentials stored in frontend code
- Backend validation of user input
- API Gateway used as the public API layer
- DynamoDB is accessed only by Lambda
- CloudWatch used for monitoring
- No direct public access to DynamoDB
- Low-traffic deployment
- No unnecessary EC2 infrastructure

### Production Improvements

This project is designed as an intermediate-level demonstration rather than a production support platform.

A production version could add:

- Amazon Cognito authentication
- User-specific request authorization
- HTTPS custom domain
- AWS WAF
- API Gateway throttling
- More restrictive CORS
- DynamoDB encryption/key management configuration
- Request status update functionality
- Admin dashboard
- Email notifications using Amazon SES
- CloudWatch alarms
- Infrastructure as Code using Terraform or AWS CDK

## Cost-Safety Considerations

The project was designed to avoid unnecessary infrastructure and operational costs.

It uses serverless services instead of continuously running servers such as EC2.

Before deploying to production, AWS pricing and current free-tier/Free Tier eligibility should be checked because AWS pricing and free usage allowances can change.

For a short-term assignment deployment:

- Keep traffic low
- Avoid unnecessary test requests
- Monitor AWS billing
- Delete resources after evaluation if they are no longer required

## Testing

The application was tested using both direct Lambda test events and the deployed API.

### Successful Tests

- Valid support request creation
- DynamoDB record creation
- Request retrieval
- Live S3 frontend submission
- Live request tracking
- API Gateway integration
- Lambda execution
- CloudWatch logging

### Error Tests

The following negative cases were also tested:

- Invalid email
- Description shorter than the allowed minimum
- Non-existent request ID

All tested validation/error cases returned the expected errors.

## Project Structure

```text
cloudsupport/
├── index.html
├── style.css
├── script.js
├── README.md
└── screenshots/
    ├── s3-website.png
    ├── api-gateway.png
    ├── lambda.png
    ├── dynamodb.png
    ├── iam.png
    ├── cloudwatch.png
    ├── successful-request.png
    ├── request-tracking.png
    └── error-validation.png
```

## Deployment Summary

### Frontend

The frontend is hosted as a static website using Amazon S3.

### Backend

AWS Lambda processes support requests and communicates with DynamoDB.

### API

API Gateway exposes:

```text
POST /requests
GET /requests/{requestId}
```

### Database

DynamoDB stores support request records using `requestId` as the partition key.

### Monitoring

CloudWatch stores Lambda execution logs.

## What This Project Demonstrates

This project demonstrates practical understanding of:

- AWS serverless architecture
- S3 static website hosting
- API Gateway HTTP APIs
- AWS Lambda
- DynamoDB
- IAM least privilege
- REST-style API design
- Backend validation
- Error handling
- CORS
- CloudWatch monitoring
- Basic cloud security
- Cost-aware deployment
- End-to-end AWS service integration

## Future Improvements

Possible future versions could introduce:

1. Authentication with Amazon Cognito
2. Admin support dashboard
3. Request status updates
4. Email notifications
5. Request history
6. Search and filtering
7. API Gateway throttling
8. AWS WAF protection
9. Infrastructure as Code using Terraform
10. CI/CD deployment using GitHub Actions

## Author

**Amarjit Bhuj**

B.Tech Computer Science & Engineering

This project was developed as part of an AWS Cloud Engineer practical evaluation.