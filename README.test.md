# Testing Documentation

## Overview

A1Score uses a comprehensive testing strategy with three layers:
- **Unit Tests**: Vitest + React Testing Library for components and hooks
- **Integration Tests**: Vitest for testing feature workflows
- **E2E Tests**: Playwright for full user journey testing

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test:unit -- src/tests/components/auth/AuthModal.test.tsx

# Run tests with UI
npm run test:ui
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- e2e/auth.spec.ts

# Run tests in specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### All Tests
```bash
# Run all tests (unit + e2e)
npm run test

# Run tests in CI mode
npm run test:ci
```

## Test Structure

### Unit Tests Location
```
src/tests/
├── components/        # Component tests
│   ├── auth/
│   ├── student/
│   └── teacher/
├── hooks/            # Hook tests
├── utils/            # Utility tests
├── setup.ts          # Test setup and mocks
└── testHelpers.tsx   # Reusable test utilities
```

### E2E Tests Location
```
e2e/
├── auth.spec.ts      # Authentication flows
├── ai-tutor.spec.ts  # AI tutor functionality
├── quiz.spec.ts      # Quiz system
└── dashboard.spec.ts # Dashboard navigation
```

## Writing Tests

### Component Tests Example
```typescript
import { renderWithProviders, mockUser } from '@/tests/utils/testHelpers';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests Example
```typescript
import { test, expect } from '@playwright/test';

test('user can complete quiz', async ({ page }) => {
  await page.goto('/student/quiz');
  await page.click('text=Mathematics');
  await expect(page.locator('h2')).toContainText('Question 1');
});
```

## Coverage Goals

- **Overall Coverage**: 80% minimum
- **Critical Paths**: 100% (auth, payments, data submission)
- **UI Components**: 70% minimum

## CI/CD Integration

Tests run automatically on:
- Every pull request
- Pushes to `main` and `develop` branches

### GitHub Actions Workflow
- Lint and type checking
- Unit tests with coverage
- E2E tests on multiple browsers
- Build verification
- Automated deployment (on main)

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Mock External Dependencies**: Use vi.mock() for API calls
3. **Test User Behavior**: Focus on what users do, not implementation
4. **Avoid Testing Implementation Details**: Test the interface, not internals
5. **Use Data Test IDs**: Add `data-testid` for complex selectors
6. **Keep Tests Independent**: No shared state between tests
7. **Clean Up**: Use `afterEach` and `cleanup` properly

## Debugging Tests

### Unit Tests
```bash
# Run in debug mode
npm run test:unit -- --inspect-brk

# Use console.log in tests
# Use screen.debug() to print DOM
```

### E2E Tests
```bash
# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Generate trace
npm run test:e2e -- --trace on
```

## Mock Data

All mock data is centralized in `src/tests/utils/testHelpers.tsx`:
- `mockUser`: Test user object
- `mockProfile`: Test profile data
- `mockQuiz`: Test quiz data
- `mockConversation`: Test chat data

## Environment Variables

Test environment variables are set in `src/tests/setup.ts`:
```typescript
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key');
```

## Continuous Improvement

- Review test coverage weekly
- Update tests when adding features
- Remove obsolete tests
- Keep test documentation updated
- Monitor test execution time
