# HydroScan Testing Documentation

## Overview

The HydroScan project includes a comprehensive testing framework with unit tests, integration tests, and end-to-end tests to ensure code quality and reliability.

## Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + Custom test utilities
- **E2E Tests**: Cypress
- **Coverage**: Vitest coverage reports

## Running Tests

### Unit Tests
```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run E2E tests headlessly
npm run test:e2e

# Run component tests
npm run test:component
```

### All Tests
```bash
# Run all tests (unit + e2e)
npm run test:all
```

## Test Structure

```
src/test/
├── components/           # Component unit tests
│   ├── ui/              # UI component tests
│   └── SensorChart.test.jsx
├── pages/               # Page component tests
│   └── Analytics.test.jsx
├── lib/                 # Utility function tests
│   ├── exportUtils.test.js
│   └── metricsUtils.test.js
├── integration/         # Integration tests
│   └── dataFlow.test.jsx
├── utils/              # Test utilities
│   └── testUtils.jsx
└── setup.js            # Test setup and mocks

cypress/
├── e2e/                # End-to-end tests
│   ├── analytics.cy.js
│   └── dataExport.cy.js
└── support/            # Cypress support files
    ├── commands.js
    └── e2e.js
```

## Test Utilities

### Custom Render Function
```javascript
import { renderWithProviders } from '../utils/testUtils';

// Renders component with all necessary providers
renderWithProviders(<MyComponent />, {
  initialSensorData: mockData,
  initialDevices: mockDevices
});
```

### Mock Data
```javascript
import { mockSensorData, mockDevices, mockUser } from '../utils/testUtils';
```

### Supabase Mocking
```javascript
import { mockSupabaseQuery, createMockSupabaseResponse } from '../utils/testUtils';

supabase.from.mockImplementation(() => 
  mockSupabaseQuery(createMockSupabaseResponse(mockData))
);
```

## Cypress Custom Commands

### Authentication
```javascript
cy.login('user@example.com', 'password');
cy.logout();
```

### Data Seeding
```javascript
cy.seedSensorData();
cy.seedDevices();
cy.cleanupTestData();
```

### UI Interactions
```javascript
cy.selectDevice('WS001');
cy.setDateRange('2024-01-01', '2024-01-31');
cy.triggerExport('csv');
cy.waitForChartToLoad();
```

## Test Coverage

The testing framework covers:

- ✅ UI Components (buttons, forms, charts)
- ✅ Page Components (Analytics, Data Export)
- ✅ Utility Functions (exports, metrics)
- ✅ Integration Flows (data flow between components)
- ✅ End-to-End Workflows (user journeys)
- ✅ API Integration (Supabase interactions)
- ✅ Error Handling (graceful degradation)

## Writing Tests

### Unit Test Example
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Test Example
```javascript
describe('User Journey', () => {
  beforeEach(() => {
    cy.seedTestData();
    cy.login();
  });

  it('completes export workflow', () => {
    cy.visit('/data-export');
    cy.selectDevice('WS001');
    cy.setDateRange('2024-01-01', '2024-01-31');
    cy.triggerExport('csv');
    cy.contains('Export successful').should('be.visible');
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **Use Descriptive Test Names**: Tests should read like specifications
3. **Mock External Dependencies**: Isolate components from external services
4. **Test Error States**: Ensure graceful handling of failures
5. **Keep Tests Fast**: Unit tests should run quickly
6. **Clean Up**: Reset state between tests

## Continuous Integration

Tests are configured to run in CI/CD pipelines:

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: |
    npm run test:run
    npm run test:e2e
```

## Debugging Tests

### Vitest
- Use `test.only()` to run specific tests
- Use `console.log()` or `screen.debug()` for debugging
- Check coverage reports for missed code paths

### Cypress
- Use `cy.pause()` to pause test execution
- Open Cypress Test Runner for visual debugging
- Check browser console for errors

## Performance Testing

For performance testing of the sensor data processing:
```bash
npm run test:sensor
```

This runs the dedicated sensor connection and performance test script.
