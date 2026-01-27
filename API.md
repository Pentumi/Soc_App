# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/register
Register a new user (admin or member)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin" // or "member"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "currentHandicap": null,
    "role": "admin",
    "createdAt": "2024-01-20T10:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### POST /auth/login
Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### GET /auth/me
Get current user information

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "currentHandicap": 18.5,
  "role": "admin",
  "profilePhoto": null,
  "createdAt": "2024-01-20T10:00:00.000Z"
}
```

## Users/Members

### GET /users
Get all society members

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "currentHandicap": 18.5,
    "profilePhoto": null,
    "role": "member",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
]
```

### GET /users/:id
Get member by ID with full details

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "currentHandicap": 18.5,
  "tournamentScores": [...],
  "handicapHistory": [...]
}
```

### POST /users (Admin only)
Create a new member

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "currentHandicap": 22.5 // optional
}
```

### PUT /users/:id (Admin only)
Update member information

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith-Jones",
  "currentHandicap": 21.0
}
```

### DELETE /users/:id (Admin only)
Delete a member

## Courses

### GET /courses
Get all golf courses

**Response:**
```json
[
  {
    "id": 1,
    "name": "Portmarnock Golf Club",
    "location": "Portmarnock, Dublin",
    "par": 72,
    "slopeRating": 138.0,
    "courseRating": 73.5,
    "createdAt": "2024-01-20T10:00:00.000Z",
    "holes": [...]
  }
]
```

### GET /courses/:id
Get course by ID with hole information

### POST /courses (Admin only)
Create a new course

**Request Body:**
```json
{
  "name": "Portmarnock Golf Club",
  "location": "Portmarnock, Dublin",
  "par": 72,
  "slopeRating": 138.0,
  "courseRating": 73.5,
  "holes": [ // optional
    {
      "holeNumber": 1,
      "par": 4,
      "strokeIndex": 10,
      "yardage": 395
    }
  ]
}
```

### PUT /courses/:id (Admin only)
Update course information

### DELETE /courses/:id (Admin only)
Delete a course

## Tournaments

### GET /tournaments
Get all tournaments with scores

**Response:**
```json
[
  {
    "id": 1,
    "name": "Spring Major 2024",
    "courseId": 1,
    "tournamentDate": "2024-03-15",
    "isMajor": true,
    "status": "completed",
    "createdAt": "2024-01-20T10:00:00.000Z",
    "course": {...},
    "tournamentScores": [...]
  }
]
```

### GET /tournaments/:id
Get tournament by ID with full details and leaderboard

### POST /tournaments (Admin only)
Create a new tournament

**Request Body:**
```json
{
  "name": "Spring Major 2024",
  "courseId": 1,
  "tournamentDate": "2024-03-15",
  "isMajor": true
}
```

### PUT /tournaments/:id (Admin only)
Update tournament information

### DELETE /tournaments/:id (Admin only)
Delete a tournament

## Scores

### POST /scores (Admin only)
Submit a tournament score

**Request Body:**
```json
{
  "tournamentId": 1,
  "userId": 2,
  "grossScore": 85
}
```

**Response:**
```json
{
  "id": 1,
  "tournamentId": 1,
  "userId": 2,
  "grossScore": 85,
  "handicapAtTime": 18.5,
  "netScore": 67,
  "position": null,
  "handicapAdjustment": 0,
  "createdAt": "2024-03-15T14:30:00.000Z",
  "user": {...},
  "tournament": {...}
}
```

### GET /scores/tournament/:tournamentId
Get leaderboard for a tournament

**Response:**
```json
[
  {
    "id": 1,
    "tournamentId": 1,
    "userId": 2,
    "grossScore": 85,
    "handicapAtTime": 18.5,
    "netScore": 67,
    "position": 1,
    "handicapAdjustment": -2,
    "user": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "profilePhoto": null,
      "currentHandicap": 16.5
    }
  }
]
```

### POST /scores/tournament/:tournamentId/complete (Admin only)
Complete a tournament and adjust handicaps

**Response:**
Tournament object with updated scores and positions

### DELETE /scores/:id (Admin only)
Delete a tournament score

## Handicaps

### GET /handicaps/user/:userId
Get handicap history for a user

**Response:**
```json
[
  {
    "id": 1,
    "userId": 2,
    "handicapIndex": 16.5,
    "tournamentId": 1,
    "reason": "tournament_win",
    "effectiveDate": "2024-03-15",
    "createdAt": "2024-03-15T16:00:00.000Z"
  }
]
```

### POST /handicaps/user/:userId/adjust (Admin only)
Manually adjust a user's handicap

**Request Body:**
```json
{
  "newHandicap": 17.0,
  "reason": "Manual adjustment" // optional
}
```

**Response:**
Updated user object

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not admin)
- `404` - Not Found
- `500` - Internal Server Error
