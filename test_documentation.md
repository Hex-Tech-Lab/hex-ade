# Testing Guide for Hex-Ade

## Quick Start

### Development Environment Tests

#### Unit Tests (Vitest)
```bash
# Run all frontend unit tests
cd apps/web && pnpm test:unit

# Run specific test file
cd apps/web && pnpm test:unit -- AgentControl.test.tsx

# With coverage
cd apps/web && pnpm test:unit:coverage
```

#### E2E Tests (Playwright)
```bash
# Start dev server first (terminal 1)
cd apps/web && pnpm dev

# Run E2E tests (terminal 2)
cd apps/web && pnpm test:e2e

# Debug mode
cd apps/web && pnpm test:e2e:debug

# Visual UI mode
cd apps/web && pnpm test:e2e:ui
```

#### Backend Tests (Pytest)
```bash
# Activate virtual environment
cd server && source .venv/bin/activate

# Run all backend tests
python -m pytest

# Run specific tests
python -m pytest tests/test_api.py -v

# With coverage
python -m pytest --cov=. --cov-report=html
```

### CI/CD Environment

Tests will run automatically in CI on:
- Code pushes to main branch
- Pull requests
- Daily scheduled builds

## Test Categories

### Frontend Unit Tests
- **Location:** `apps/web/src/test/`
- **Purpose:** Component logic, hooks, utilities
- **Technology:** Vitest + React Testing Library
- **Key Tests:** AgentControl, WebSocket hooks

### Frontend E2E Tests
- **Location:** `apps/web/tests/e2e/`
- **Purpose:** User workflows, integration
- **Technology:** Playwright (Chromium)
- **Key Workflows:** Project CRUD, Agent lifecycle, Chat interfaces

### Backend Unit Tests
- **Location:** `server/tests/`
- **Purpose:** API logic, WebSocket protocol
- **Technology:** pytest + FastAPI test client
- **Key Tests:** Project API, Feature API, Agent API

## Writing New Tests

### Frontend Unit Test Template
```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { YourComponent } from '@/components/YourComponent'

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent data={mockData} />)
    expect(screen.getByText('expected text')).toBeInTheDocument()
  })
})
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should perform user action', async ({ page }) => {
    // Test implementation
    await expect(page.locator('text=result')).toBeVisible()
  })
})
```

### Backend Test Template
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_api_endpoint():
    async with AsyncClient(base_url="http://testserver") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
```

## Debug and Troubleshooting

### Common Issues

#### E2E Tests Failing
- Ensure dev server is running on port 3000
- Check network connectivity
- Clear Playwright cache: `cd apps/web && npx playwright install`

#### WebSocket Tests Failing
- Tests mock WebSocket - ensure MSW is properly configured
- Check test environment setup in vite.config.ts

#### Backend Tests Failing
- Activate virtual environment: `source .venv/bin/activate`
- Ensure all dependencies installed: `pip install -r requirements.txt`

## Performance Benchmarks

Target test execution times:
- Unit tests: < 30 seconds
- E2E tests: < 5 minutes
- Integration tests: < 2 minutes

## Contributing

When adding new tests:
1. Follow existing patterns
2. Add descriptive test names
3. Include test data setup/teardown
4. Update this documentation if needed