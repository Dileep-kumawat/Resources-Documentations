# Jest — Complete Revision Notes (for MERN Stack Dev)

> Quick-scan notes to refresh Jest in minutes. Read top to bottom or jump to a section.

---

## 1. What is Jest & Why

- **Jest** = JavaScript testing framework by Meta. Test runner + assertion library + mocking library + coverage tool, all in one (no need for Mocha+Chai+Sinon combo).
- In **MERN**, Jest is used for:
  - **Backend (Node/Express)**: unit tests for controllers, services, utils; integration tests for API routes (with Supertest).
  - **Frontend (React)**: component tests (with React Testing Library), hooks, Redux reducers/actions, utility functions.
- Default test runner for **Create React App**. For Vite projects, often swapped for Vitest, but Jest still works.

---

## 2. Installation & Setup

```bash
npm install --save-dev jest
```

**package.json**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### For Babel / ESM (modern JS, JSX in backend tests too)
```bash
npm install --save-dev babel-jest @babel/core @babel/preset-env @babel/preset-react
```
`babel.config.js`
```js
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react']
};
```

### For React (with React Testing Library)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### `jest.config.js` (common options)
```js
module.exports = {
  testEnvironment: 'node',        // or 'jsdom' for React/DOM tests
  setupFilesAfterEach: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
```
> Note: backend → `testEnvironment: 'node'`; React/frontend → `testEnvironment: 'jsdom'`.

---

## 3. Basic Test Anatomy

```js
// sum.js
function sum(a, b) { return a + b; }
module.exports = sum;
```

```js
// sum.test.js
const sum = require('./sum');

describe('sum function', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('adds negative numbers', () => {   // it() === test(), alias
    expect(sum(-1, -2)).toBe(-3);
  });
});
```

- File naming: `*.test.js` or `*.spec.js`, or inside a `__tests__` folder.
- `describe` → groups related tests (a "test suite").
- `test`/`it` → a single test case.
- `expect(value)` → wraps the actual value to assert against.

---

## 4. Matchers (Cheat Sheet)

| Category | Matcher | Example |
|---|---|---|
| Equality | `.toBe(x)` | exact (===) match — primitives |
| Equality | `.toEqual(x)` | deep equality — objects/arrays |
| Equality | `.toStrictEqual(x)` | like toEqual but checks `undefined` props & types too |
| Truthiness | `.toBeNull()` / `.toBeUndefined()` / `.toBeDefined()` | |
| Truthiness | `.toBeTruthy()` / `.toBeFalsy()` | |
| Numbers | `.toBeGreaterThan(x)` / `.toBeLessThan(x)` | |
| Numbers | `.toBeCloseTo(x, digits)` | for floating point |
| Strings | `.toMatch(/regex/)` | |
| Arrays/Iterables | `.toContain(item)` | |
| Arrays | `.toHaveLength(n)` | |
| Objects | `.toHaveProperty('key', value)` | |
| Exceptions | `.toThrow()` / `.toThrow('msg')` | wrap call in `() => fn()` |
| Negation | `.not.toBe(x)` | prepend `.not` to any matcher |

```js
expect(() => divide(1, 0)).toThrow('Cannot divide by zero');
expect(user).toHaveProperty('email', 'a@b.com');
expect([1, 2, 3]).toContain(2);
```

---

## 5. Setup & Teardown Hooks

```js
beforeAll(() => { /* runs once before all tests in this file */ });
afterAll(() => { /* runs once after all tests */ });
beforeEach(() => { /* runs before every test */ });
afterEach(() => { /* runs after every test */ });
```

**MERN use case** — typical DB test file:
```js
beforeAll(async () => {
  await mongoose.connect(MONGO_TEST_URI);
});

afterEach(async () => {
  await User.deleteMany(); // clean state between tests
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

Scoping: hooks inside a `describe` block only apply to that block's tests.

---

## 6. Mocking — The Core Superpower

### 6.1 `jest.fn()` — mock function
```js
const mockCallback = jest.fn(x => x + 1);
mockCallback(5);

expect(mockCallback).toHaveBeenCalled();
expect(mockCallback).toHaveBeenCalledWith(5);
expect(mockCallback).toHaveBeenCalledTimes(1);
expect(mockCallback.mock.results[0].value).toBe(6);
```

Control return values:
```js
const mock = jest.fn();
mock.mockReturnValue(42);
mock.mockReturnValueOnce(1).mockReturnValueOnce(2); // sequential
mock.mockResolvedValue({ data: 'ok' });   // for async
mock.mockRejectedValue(new Error('fail'));
mock.mockImplementation((a, b) => a + b); // custom logic
```

### 6.2 `jest.mock()` — mock entire module
```js
jest.mock('../utils/emailService'); // auto-mocks all exports

const emailService = require('../utils/emailService');
emailService.sendEmail.mockResolvedValue(true);
```

**Mocking axios (common in MERN frontend)**
```js
jest.mock('axios');
import axios from 'axios';

test('fetches users', async () => {
  axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Tom' }] });
  const users = await fetchUsers();
  expect(users).toHaveLength(1);
});
```

### 6.3 `jest.spyOn()` — spy/mock a method, keep or override behavior
```js
const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
// ... test code that calls console.log
expect(spy).toHaveBeenCalled();
spy.mockRestore(); // restore original
```

> Use `spyOn` when you want to track real calls or selectively override one method on an existing object/module.

### 6.4 Manual mocks for Mongoose models
```js
jest.mock('../models/User');
const User = require('../models/User');

User.findById = jest.fn().mockResolvedValue({ _id: '1', name: 'Alice' });
```

### 6.5 Cleaning up mocks
```js
afterEach(() => {
  jest.clearAllMocks();   // clears mock.calls / mock.results
  // jest.resetAllMocks(); // also resets implementations
  // jest.restoreAllMocks(); // restores original (un-mocked) implementation
});
```

---

## 7. Async Testing

```js
// async/await (preferred)
test('fetches data', async () => {
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});

// Promises with .resolves / .rejects
test('resolves to value', () => {
  return expect(fetchData()).resolves.toBe('peanut butter');
});

test('rejects with error', () => {
  return expect(fetchData()).rejects.toThrow('error');
});
```

> Avoid the old `done()` callback style unless dealing with legacy event-based code — easy to forget calling `done()` and get false-positive passing tests.

---

## 8. Testing Express APIs — Supertest

```bash
npm install --save-dev supertest
```

```js
const request = require('supertest');
const app = require('../app'); // exported Express app (not app.listen())

describe('GET /api/users', () => {
  test('responds with 200 and a list', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST creates a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@test.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });
});
```

**Key tip:** export the Express `app` separately from the `server.listen()` call so Supertest can use it without binding a real port:
```js
// app.js
module.exports = app;
// server.js
const app = require('./app');
app.listen(PORT, ...);
```

---

## 9. Testing with MongoDB

### Option A — `mongodb-memory-server` (in-memory DB, isolated, fast)
```bash
npm install --save-dev mongodb-memory-server
```
```js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Option B — Mock Mongoose models entirely (pure unit test, no DB at all)
```js
jest.mock('../models/Post');
Post.create = jest.fn().mockResolvedValue({ _id: '123', title: 'Hi' });
```

> Rule of thumb: **unit tests** mock the model; **integration tests** use `mongodb-memory-server` or a dedicated test DB.

---

## 10. Testing React Components (Jest + React Testing Library)

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

test('renders login form and submits', () => {
  render(<LoginForm onSubmit={mockSubmit} />);

  const emailInput = screen.getByLabelText(/email/i);
  fireEvent.change(emailInput, { target: { value: 'a@b.com' } });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

**Common queries:** `getByText`, `getByRole`, `getByLabelText`, `getByTestId`, `queryByText` (returns null instead of throwing — good for asserting absence), `findByText` (async, waits for element).

**Common jest-dom matchers:** `.toBeInTheDocument()`, `.toBeVisible()`, `.toBeDisabled()`, `.toHaveTextContent()`, `.toHaveClass()`.

**Testing hooks:**
```bash
npm install --save-dev @testing-library/react-hooks
```
```js
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from './useCounter';

test('increments counter', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

**Mocking fetch/axios calls inside components:** mock the API module the component imports, then assert UI updates after the promise resolves using `findBy...` or `waitFor`.

```js
import { waitFor } from '@testing-library/react';

test('shows fetched data', async () => {
  render(<UserList />);
  await waitFor(() => expect(screen.getByText('Tom')).toBeInTheDocument());
});
```

---

## 11. Snapshot Testing

```js
import renderer from 'react-test-renderer';

test('renders correctly', () => {
  const tree = renderer.create(<Button label="Click" />).toJSON();
  expect(tree).toMatchSnapshot();
});
```
- First run → creates `__snapshots__/Component.test.js.snap`.
- Later runs → diffs against saved snapshot; fails if UI changed unexpectedly.
- Update intentionally with: `jest --updateSnapshot` (or `-u`).
- Good for: stable, small UI components. Avoid for huge/volatile components (snapshots become noisy and meaningless).

---

## 12. Code Coverage

```bash
jest --coverage
```
- Generates report in `/coverage` (open `coverage/lcov-report/index.html` in browser).
- Metrics: **Statements, Branches, Functions, Lines**.
- Set thresholds in `jest.config.js`:
```js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

---

## 13. Mocking Timers (setTimeout/setInterval, e.g. debounce/throttle/OTP expiry)

```js
jest.useFakeTimers();

test('calls callback after delay', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  jest.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();
});

jest.useRealTimers(); // reset after
```

---

## 14. Useful CLI Flags

| Command | Purpose |
|---|---|
| `jest` | run all tests once |
| `jest --watch` | watch mode, reruns on file change |
| `jest --watchAll` | watch all files, not just changed ones |
| `jest path/to/file.test.js` | run a single test file |
| `jest -t "test name"` | run tests matching a name pattern |
| `jest --coverage` | generate coverage report |
| `jest --verbose` | print each individual test name |
| `jest --runInBand` | run tests serially (useful for shared DB state) |
| `jest -u` | update snapshots |

**Focusing/skipping tests during dev:**
```js
test.only('runs only this test', () => {...});
test.skip('skip this for now', () => {...});
describe.only(...); describe.skip(...);
```

---

## 15. Best Practices / Common Pitfalls

- ✅ Keep tests **isolated** — no shared mutable state between tests (`beforeEach` resets things).
- ✅ Use `mockClear()`/`clearAllMocks()` in `afterEach` to avoid call-count leakage across tests.
- ✅ Export Express `app` without calling `.listen()` for testability with Supertest.
- ✅ Prefer `async/await` over `done()` callbacks.
- ✅ Test **behavior**, not implementation details (especially for React — avoid testing internal state directly; test what the user sees/does).
- ✅ Use `mongodb-memory-server` for integration tests instead of hitting your real dev/prod DB.
- ❌ Don't overuse snapshot testing for large/complex components — diffs become unreadable.
- ❌ Don't forget `testEnvironment` mismatch (`node` vs `jsdom`) — a very common source of "document is not defined" or DOM-related errors.
- ❌ Avoid testing third-party library internals (e.g., don't test that axios itself works — mock it and test *your* code's reaction to its response).

---

## 16. Quick Mental Model Summary

```
Jest = Test Runner + Assertions (expect) + Mocking (jest.fn/mock/spyOn) + Coverage

Backend (Node/Express) → Jest + Supertest + (mongodb-memory-server | mocked Mongoose)
Frontend (React)        → Jest + React Testing Library + jest-dom matchers
```

**Typical MERN test pyramid:**
1. **Unit tests** — pure functions, utils, reducers, isolated controller logic (mock everything external).
2. **Integration tests** — API routes with Supertest + real/in-memory DB.
3. **Component tests** — React UI behavior with RTL.
4. (E2E tests — Cypress/Playwright, outside Jest's scope, but good to know the boundary.)

---
*End of notes — revisit Section 6 (Mocking) and Section 8–10 (API/React testing) first if short on time; they cover 80% of day-to-day MERN testing work.*
