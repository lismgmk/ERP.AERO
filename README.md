# NestJS API Service

A RESTful API service built with NestJS framework that provides JWT authentication and file management capabilities.

## Features

- User authentication with JWT tokens
  - Signup: Create a new user account
  - Signin: Authenticate using credentials and receive tokens
  - Token refresh: Get new access tokens using refresh tokens
  - Logout: Revoke tokens for security
- File management
  - Upload: Upload files to the server
  - List: Get paginated lists of files
  - Info: Get detailed information about files
  - Download: Retrieve files from the server
  - Update: Replace existing files
  - Delete: Remove files from the server
- Security
  - JWT authentication
  - Token revocation
  - Multiple device login support
  - Password hashing

## API Endpoints

### Authentication

- `POST /api/signup`: Register a new user
  - Body: `{ "id": "email@example.com", "password": "yourpassword" }`
  - Returns: JWT access token and refresh token

- `POST /api/signin`: Login with existing credentials
  - Body: `{ "id": "email@example.com", "password": "yourpassword" }`
  - Returns: JWT access token and refresh token

- `POST /api/signin/new_token`: Refresh the access token
  - Body: `{ "refreshToken": "your-refresh-token" }`
  - Returns: New JWT access token and refresh token

- `GET /api/logout`: Logs out the current user (revokes token)
  - Requires: Authorization header with Bearer token
  - Returns: Success message

- `GET /api/info`: Gets current user information
  - Requires: Authorization header with Bearer token
  - Returns: User information

### File Management

- `POST /api/file/upload`: Upload a new file
  - Requires: Authorization header, multipart form data with file
  - Returns: File information

- `GET /api/file/list`: Get a paginated list of files
  - Requires: Authorization header
  - Query parameters: `list_size` (default: 10), `page` (default: 1)
  - Returns: List of files with pagination metadata

- `GET /api/file/:id`: Get file information
  - Requires: Authorization header
  - Returns: File metadata

- `GET /api/file/download/:id`: Download a file
  - Requires: Authorization header
  - Returns: The file content

- `PUT /api/file/update/:id`: Update an existing file
  - Requires: Authorization header, multipart form data with file
  - Returns: Updated file information

- `DELETE /api/file/delete/:id`: Delete a file
  - Requires: Authorization header
  - Returns: Success message

## Authentication Details

- Access tokens are valid for 10 minutes
- Refresh tokens are valid for 7 days
- Tokens are automatically revoked on logout
- Each user can have multiple active sessions (different devices)

## Technical Implementation

- NestJS framework for API development
- TypeORM for database interaction with PostgreSQL
- Passport.js for authentication strategies
- Multer for file upload handling
- JWT for token-based authentication
- bcrypt for password hashing

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing

## Running the Application

The application runs on port 5000 with the `/api` prefix for all endpoints.