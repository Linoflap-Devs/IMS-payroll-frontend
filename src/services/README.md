# API Services

This directory contains all API services for the application.

## Structure

- `api/` - Contains all API related services
  - `client.ts` - Base Axios client configuration with interceptors
  - `auth.ts` - Authentication related API services (login, logout)
  - `users.ts` - User related API services
  - `general.ts` - General API utilities for common operations
  - `index.ts` - Re-exports all services for easier imports

## Usage

Import and use the services in your components:

```typescript
// Import specific services
import { authService, userService } from '@/src/services/api';

// Example: Login
const response = await authService.login({ email, password });

// Example: Get current user
const user = await userService.getCurrentUser();
```

For one-off API calls, you can use the general service:

```typescript
import { generalService } from '@/src/services/api';

// Example: Custom GET request
const data = await generalService.get('/api/custom-endpoint');
```

## Adding New Services

To add a new service domain:

1. Create a new file in the `src/services/api/` directory (e.g., `payments.ts`)
2. Define and export your service object with methods
3. Update `index.ts` to re-export your new service 