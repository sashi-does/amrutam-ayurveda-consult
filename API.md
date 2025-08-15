# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## User Endpoints

### POST /user/signup
Register a new user (patient by default).

**Request:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  },
  "token": "string"
}
```

### POST /user/signin
Authenticate user and get access token.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "string",
    "firstName": "string"
  }
}
```

### POST /user/lock-slot 🔒
Lock a time slot for appointment booking (10 minute lock duration).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "slotId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slot locked successfully"
}
```

### POST /user/appointments/create 🔒
Create a new appointment using a locked slot. (Patient role only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "slotId": "string",
  "mode": "online | in_person",
  "consultationFee": "number",
  "symptoms": "string",
  "notes": "string",
  "paymentStatus": "string"
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "string",
    "slotId": "string",
    "patientId": "string",
    "doctorId": "string",
    "status": "confirmed",
    "mode": "string",
    "consultationFee": "number",
    "symptoms": "string",
    "confirmedAt": "string"
  }
}
```

### POST /user/otp/send 🔒
Send OTP to user's email for verification (10 minute expiry).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### POST /user/otp/verify 🔒
Verify OTP and mark user as verified.

**Headers:**
```
Authorization: Bearer <token>
otp: <6_digit_otp>
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully!"
}
```

### GET /user/appointments 🔒
Get all appointments for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "string",
      "slotId": "string",
      "patientId": "string",
      "doctorId": "string",
      "status": "string",
      "mode": "string",
      "consultationFee": "number",
      "symptoms": "string",
      "createdAt": "string",
      "slot": {
        "id": "string",
        "startTime": "string",
        "endTime": "string",
        "doctor": {
          "id": "string",
          "specialization": "string",
          "experience": "number",
          "consultationFee": "number"
        }
      }
    }
  ]
}
```

## Doctor Endpoints

### POST /doctor/register
Register a new doctor (requires admin approval).

**Request:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "specialization": "string",
  "experience": "number",
  "consultationFee": "number",
  "mode": "online | in_person | both",
  "bio": "string",
  "qualifications": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor registered successfully. Awaiting admin approval.",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "doctor"
  },
  "doctor": {
    "id": "string",
    "userId": "string",
    "specialization": "string",
    "experience": "number",
    "consultationFee": "number",
    "mode": "string",
    "bio": "string",
    "qualifications": "string",
    "rating": 0,
    "totalReviews": 0,
    "isApproved": false
  }
}
```

### POST /doctor/login
Authenticate doctor and get access token.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "role": "doctor"
  }
}
```

### POST /doctor/slot/create
Create a new available time slot for appointments.

**Request:**
```json
{
  "doctorId": "string",
  "startTime": "string",
  "endTime": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "doctorId": "string",
  "startTime": "string",
  "endTime": "string",
  "isBooked": false,
  "createdAt": "string"
}
```

### GET /doctor/all
Get all registered doctors with user information.

**Response:**
```json
{
  "doctors": [
    {
      "id": "string",
      "userId": "string",
      "specialization": "string",
      "experience": "number",
      "consultationFee": "number",
      "mode": "string",
      "bio": "string",
      "qualifications": "string",
      "rating": "number",
      "totalReviews": "number",
      "isApproved": "boolean",
      "isActive": "boolean",
      "createdAt": "string",
      "user": {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "role": "doctor"
      }
    }
  ]
}
```

### GET /doctor/filter
Get doctors filtered by specialization and/or consultation mode.

**Query Parameters:**
```
specialization (optional) - Filter by doctor specialization
mode (optional) - Filter by consultation mode (online/in_person)
```

**Response:**
```json
{
  "success": true,
  "doctors": [
    {
      "id": "string",
      "userId": "string",
      "specialization": "string",
      "experience": "number",
      "consultationFee": "number",
      "mode": "string",
      "bio": "string",
      "qualifications": "string",
      "rating": "number",
      "totalReviews": "number",
      "isApproved": "boolean",
      "slots": [
        {
          "id": "string",
          "startTime": "string",
          "endTime": "string",
          "isBooked": "boolean"
        }
      ]
    }
  ]
}
```

### GET /doctor/slot/all
Get all time slots for a specific doctor.

**Query Parameters:**
```
doctorId (required) - The doctor's ID
```

**Response:**
```json
{
  "success": true,
  "doctorId": "string",
  "slots": [
    {
      "id": "string",
      "doctorId": "string",
      "startTime": "string",
      "endTime": "string",
      "isBooked": "boolean",
      "createdAt": "string"
    }
  ]
}
```

## Error Response Format
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Error message"
}
```
