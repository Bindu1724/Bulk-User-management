# Bulk User Management System - API Documentation

## Overview
This is a Node.js + Express + MongoDB REST API for managing bulk user operations.

## Setup & Installation

### Prerequisites
- Node.js v14 or higher
- MongoDB running locally or MongoDB Atlas connection string

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Update .env with your MongoDB connection:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/bulk-user-management
   PORT=5000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### 1. Bulk Create Users
**POST** `/api/users/bulk-create`

Creates multiple users in a single request using MongoDB `insertMany()`.

**Request Body:**
```json
[
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "walletBalance": 1000,
    "isBlocked": false,
    "kycStatus": "Pending",
    "deviceInfo": {
      "ipAddress": "192.168.1.1",
      "deviceType": "Mobile",
      "os": "Android"
    }
  },
  {
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543211",
    "walletBalance": 500,
    "isBlocked": false,
    "kycStatus": "Approved",
    "deviceInfo": {
      "ipAddress": "192.168.1.2",
      "deviceType": "Desktop",
      "os": "Windows"
    }
  }
]
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Successfully created 2 users",
  "data": [
    {
      "_id": "67b1f2c3d4e5f6g7h8i9j0k1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "walletBalance": 1000,
      "isBlocked": false,
      "kycStatus": "Pending",
      "deviceInfo": {
        "ipAddress": "192.168.1.1",
        "deviceType": "Mobile",
        "os": "Android"
      },
      "createdAt": "2026-02-18T10:30:00.000Z",
      "updatedAt": "2026-02-18T10:30:00.000Z"
    }
  ]
}
```

**Partial Failure Response (207):**
```json
{
  "success": false,
  "statusCode": 207,
  "message": "Partial bulk create - some documents failed",
  "insertedCount": 1,
  "failedCount": 1,
  "insertedDocs": [...],
  "errors": [
    {
      "index": 1,
      "errmsg": "E11000 duplicate key error collection: bulk-user-management.users index: email_1 dup key: { email: \"existing@example.com\" }"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    "Full name must be at least 3 characters",
    "Please provide a valid email address"
  ]
}
```

---

### 2. Bulk Update Users
**PUT** `/api/users/bulk-update`

Updates multiple users using MongoDB `bulkWrite()`.

**Request Body (updateOne operations):**
```json
[
  {
    "updateOne": {
      "filter": { "_id": "67b1f2c3d4e5f6g7h8i9j0k1" },
      "update": {
        "walletBalance": 2000,
        "kycStatus": "Approved"
      }
    }
  },
  {
    "updateOne": {
      "filter": { "email": "jane@example.com" },
      "update": {
        "isBlocked": true
      }
    }
  }
]
```

**Request Body (updateMany operations):**
```json
[
  {
    "updateMany": {
      "filter": { "kycStatus": "Pending" },
      "update": {
        "kycStatus": "Approved"
      }
    }
  }
]
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bulk update completed successfully",
  "data": {
    "matched": 2,
    "modified": 2,
    "upserted": 0,
    "deletedCount": 0,
    "insertedCount": 0
  }
}
```

**Partial Failure Response (207):**
```json
{
  "success": false,
  "statusCode": 207,
  "message": "Partial bulk update - some operations failed",
  "data": {
    "matched": 1,
    "modified": 1,
    "upserted": 0
  },
  "errors": [...]
}
```

---

### 3. Get All Users
**GET** `/api/users?page=1&limit=10`

Retrieves all users with pagination support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 4. Get Single User
**GET** `/api/users/:id`

Retrieves a specific user by ID.

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "67b1f2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "walletBalance": 1000,
    "isBlocked": false,
    "kycStatus": "Pending",
    "deviceInfo": {...},
    "createdAt": "2026-02-18T10:30:00.000Z",
    "updatedAt": "2026-02-18T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

---

## Field Specifications

### Core Identity Fields
- **fullName** (String, Required): Minimum 3 characters, automatically trimmed
- **email** (String, Required): Valid email format, lowercase, unique index
- **phone** (String, Required): Numeric validation, unique index, minimum 10 digits

### Financial Fields
- **walletBalance** (Number): Default 0, minimum value 0

### Account Status Fields
- **isBlocked** (Boolean): Default false
- **kycStatus** (Enum): 'Pending', 'Approved', 'Rejected' (default: 'Pending')

### Device & Tracking Information
- **deviceInfo.ipAddress** (String): Optional
- **deviceInfo.deviceType** (String): 'Mobile' or 'Desktop'
- **deviceInfo.os** (String): 'Android', 'iOS', 'Windows', or 'macOS'

### System Managed Fields
- **createdAt** (Date): Auto-generated on user creation
- **updatedAt** (Date): Auto-updated on every modification

---

## Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes:

- **400 Bad Request**: Validation errors or malformed requests
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate key errors (email or phone already exists)
- **500 Internal Server Error**: Server-side errors
- **207 Multi-Status**: Partial success in bulk operations

---

## Testing the API

You can test the endpoints using cURL, Postman, or any HTTP client.

### Example using cURL:

**Bulk Create:**
```bash
curl -X POST http://localhost:5000/api/users/bulk-create \
  -H "Content-Type: application/json" \
  -d '[
    {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    }
  ]'
```

**Bulk Update:**
```bash
curl -X PUT http://localhost:5000/api/users/bulk-update \
  -H "Content-Type: application/json" \
  -d '[
    {
      "updateOne": {
        "filter": { "email": "john@example.com" },
        "update": { "walletBalance": 2000 }
      }
    }
  ]'
```

---

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   └── errorHandler.js      # Global error handling middleware
├── models/
│   └── User.js              # User schema and model
├── routes/
│   └── userRoutes.js        # API route endpoints
├── server.js                # Main application file
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
└── README.md                # This file
```

---

## Notes

- The API automatically handles `updatedAt` field updates on create and modify operations
- Bulk operations use MongoDB's `insertMany()` and `bulkWrite()` for optimal performance
- Duplicate key errors are handled gracefully with appropriate HTTP 409 status
- All email fields are automatically converted to lowercase
- fullName fields are automatically trimmed of whitespace
