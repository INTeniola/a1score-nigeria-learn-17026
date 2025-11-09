# Authentication TypeScript Type System

This document describes the comprehensive type system implemented for authentication in A1Score.

## Core Type Files

### 1. `src/types/auth.ts`
Central type definitions for all authentication-related functionality.

#### User Types
```typescript
type UserType = 'student' | 'teacher' | 'parent' | 'admin';
```

#### Form Data Types
- `SignInFormData` - Email and password for sign in
- `SignUpFormData` - Full registration form with user type and display name
- `UserMetadata` - Data stored in auth.users.raw_user_meta_data

#### Response Types
- `AuthResponse` - Result from sign in operations
- `SignUpResponse` - Result from sign up (includes emailConfirmationRequired flag)
- `UserProfile` - User profile from profiles table

#### Context Types
- `AuthContextType` - Full authentication context interface
- `InternalAuthContextType` - Internal implementation with all methods

### 2. `src/lib/auth-validation.ts`
Runtime validation using Zod schemas and utility functions.

#### Zod Schemas
- `emailSchema` - Email validation with lowercase/trim
- `passwordSchema` - Password requirements validation
- `displayNameSchema` - Display name validation (2-50 chars)
- `signInSchema` - Full sign in form validation
- `signUpSchema` - Full sign up form with password match check

#### Validation Functions
```typescript
// Validate email with detailed error
function validateEmail(email: string): EmailValidationResult

// Validate password with strength calculation
function validatePassword(password: string, requirements?: PasswordRequirements): PasswordValidationResult

// Check passwords match
function validatePasswordMatch(password: string, confirmPassword: string): boolean

// Sanitize user input to prevent XSS
function sanitizeInput(input: string): string
```

## Updated Components

### `src/hooks/useAuth.tsx`
Enhanced authentication hook with full type safety:

```typescript
interface InternalAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (data: SignInFormData) => Promise<AuthResponse>;
  signUp: (data: SignUpFormData) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Usage example
const { user, profile, signIn, signOut } = useAuth();

// Type-safe sign in
const result = await signIn({
  email: 'user@example.com',
  password: 'password123'
});

if (result.error) {
  console.error(result.error.message);
}
```

### `src/components/auth/AuthPage.tsx`
Fully typed authentication page with:
- Proper form event types (`FormEvent<HTMLFormElement>`)
- Input change handlers with explicit types (`ChangeEvent<HTMLInputElement>`)
- Field-level error tracking with `Record<string, string>`
- Integration with Zod validation
- Type-safe location state

```typescript
interface LocationState {
  userType?: UserType;
  redirectTo?: string;
}

const locationState = location.state as LocationState | null;
```

### `src/components/auth/UserTypeSelector.tsx`
Enhanced with:
- `UserTypeConfig` interface for user type definitions
- Proper event handlers with accessibility
- Type-safe navigation state
- Optional callback props

## Type Safety Best Practices

### 1. Use Proper Return Types
```typescript
// ✅ Good - Explicit return type
const handleSubmit = async (): Promise<void> => {
  // ...
}

// ❌ Bad - Inferred return type
const handleSubmit = async () => {
  // ...
}
```

### 2. Use Type Guards
```typescript
// ✅ Good - Type guard for error handling
if (error instanceof Error) {
  setError(error.message);
} else {
  setError('Unknown error');
}

// ❌ Bad - Unsafe type assertion
setError((error as Error).message);
```

### 3. Avoid `any` Type
```typescript
// ✅ Good - Proper type definition
interface LocationState {
  userType?: UserType;
}
const state = location.state as LocationState | null;

// ❌ Bad - Using any
const state = location.state as any;
```

### 4. Use Discriminated Unions
```typescript
// ✅ Good - Discriminated union for responses
interface SuccessResponse {
  success: true;
  data: User;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type Response = SuccessResponse | ErrorResponse;
```

### 5. Explicit Event Types
```typescript
// ✅ Good - Explicit event types
const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
}

// ❌ Bad - Generic event type
const handleChange = (e: any) => {
  setValue(e.target.value);
}
```

## Runtime Validation

### Using Zod Schemas
```typescript
import { signUpSchema } from '@/lib/auth-validation';

// Validate entire form
try {
  const validData = signUpSchema.parse(formData);
  // Data is now type-safe and validated
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    error.errors.forEach(err => {
      console.log(err.path, err.message);
    });
  }
}

// Or validate individual fields
const emailValidation = validateEmail(email);
if (!emailValidation.isValid) {
  setError(emailValidation.error);
}
```

## Accessibility Improvements

### ARIA Attributes
```typescript
<Input
  id="email"
  aria-invalid={!!fieldErrors.email}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
/>
{fieldErrors.email && (
  <p id="email-error" className="text-sm text-destructive">
    {fieldErrors.email}
  </p>
)}
```

### Keyboard Navigation
```typescript
<div
  role="button"
  tabIndex={0}
  onClick={() => handleSelect(value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(value);
    }
  }}
  aria-pressed={isSelected}
>
```

## Security Enhancements

### Input Sanitization
```typescript
import { sanitizeInput } from '@/lib/auth-validation';

// Sanitize before using in UI
const safeDisplayName = sanitizeInput(userInput);
```

### Validation Before API Calls
```typescript
// Always validate on client before API call
const passwordValidation = validatePassword(password);
if (!passwordValidation.isValid) {
  setErrors(passwordValidation.errors);
  return;
}

// Then send to API
await signUp({ email, password, ... });
```

### Email Domain Validation
```typescript
import { isValidEmailDomain } from '@/lib/auth-validation';

if (!isValidEmailDomain(email)) {
  setWarning('Did you mean gmail.com?');
}
```

## Error Handling Patterns

### Type-Safe Error Handling
```typescript
try {
  const result = await signIn(credentials);
  if (result.error) {
    // Handle AuthError
    setError(result.error.message);
  }
} catch (err) {
  // Handle unexpected errors
  const errorMessage = err instanceof Error 
    ? err.message 
    : "An unexpected error occurred";
  setError(errorMessage);
}
```

### Field-Level Errors
```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

// Set field error
setFieldErrors(prev => ({ ...prev, email: 'Invalid email' }));

// Clear field error on change
const handleChange = (field: string) => {
  if (fieldErrors[field]) {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }
};
```

## Migration Guide

### From Loose Types to Strict Types

1. **Add Type Imports**
```typescript
// Before
const [userData, setUserData] = useState({});

// After
import type { SignUpFormData } from '@/types/auth';
const [userData, setUserData] = useState<SignUpFormData>({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  userType: 'student'
});
```

2. **Add Validation**
```typescript
// Before
if (password !== confirmPassword) {
  setError("Passwords don't match");
}

// After
import { validatePasswordMatch } from '@/lib/auth-validation';
if (!validatePasswordMatch(password, confirmPassword)) {
  setError("Passwords don't match");
}
```

3. **Use Type-Safe Hooks**
```typescript
// Before
const { user } = useAuth();
const userType = user?.user_metadata?.user_type;

// After
const { user, profile } = useAuth();
const userType: UserType = profile?.user_type || 'student';
```

## Testing Types

### Type Testing Examples
```typescript
import type { SignInFormData, AuthResponse } from '@/types/auth';

describe('Auth Types', () => {
  it('accepts valid sign in data', () => {
    const data: SignInFormData = {
      email: 'test@example.com',
      password: 'password123'
    };
    expect(data).toBeDefined();
  });

  it('properly types auth response', async () => {
    const response: AuthResponse = await signIn(credentials);
    
    // TypeScript knows these properties exist
    if (response.error) {
      console.log(response.error.message);
    } else if (response.user) {
      console.log(response.user.id);
    }
  });
});
```

## Future Improvements

1. **Enable Strict Mode** (blocked by read-only tsconfig.json)
   - strictNullChecks
   - noImplicitAny
   - noUnusedParameters
   - noUnusedLocals

2. **Add More Validation Rules**
   - Common password patterns
   - Email provider suggestions
   - Password strength meter

3. **Enhanced Error Types**
   - Error codes enum
   - Structured error responses
   - I18n error messages

4. **Type Guards for Database Types**
   - Runtime validation of Supabase responses
   - Type narrowing utilities

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Zod Documentation](https://zod.dev/)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
