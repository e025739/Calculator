# 🧮 Web Calculator with Memory

Full Stack web calculator with memory functions, built as a coding assignment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | ASP.NET Core Web API (.NET 8) |
| **Frontend** | React + TypeScript + Vite |
| **Design Patterns** | Strategy, Chain of Responsibility, Reducer (Flux), DI, Middleware |

## Features

- Multi-operand expressions with operator precedence (e.g., `2 + 3 * 4` = 14)
- Basic arithmetic: `+`, `-`, `*`, `/`
- Memory operations: `MR` (recall), `M+` (add), `M-` (subtract), `MC` (clear memory)
- Keyboard support: digit keys, operators, Enter/= for equals, Escape for clear
- Server-side calculation and memory storage
- Global error handling (division by zero, invalid operators)
- Modern UI, responsive design

## Project Structure

```
Calculator/
├── server/                    # ASP.NET Core Web API
│   ├── Controllers/           # REST API endpoints
│   ├── Services/              # Business logic (Calculator + Memory)
│   ├── Handlers/              # Chain of Responsibility (operator precedence)
│   ├── Operations/            # Strategy Pattern (IOperation implementations)
│   ├── Middleware/             # Global exception handling (ProblemDetails)
│   ├── Models/                # Request/Response DTOs with validation
│   └── Program.cs             # DI, CORS, Swagger, Middleware config
├── server-tests/              # xUnit unit tests
│   ├── PrecedenceHandlerTests.cs
│   ├── CalculatorServiceTests.cs
│   ├── CalculationRequestValidationTests.cs
│   └── MemoryServiceTests.cs
├── client/                    # React + TypeScript + Vite
│   └── src/
│       ├── components/        # Calculator UI component
│       ├── hooks/             # useCalculator — all logic separated from UI
│       ├── services/          # apiService — centralized HTTP calls
│       └── types/             # TypeScript interfaces
└── README.md
```

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)

### Run the Backend

```bash
cd server
dotnet run
```

The API will start at `http://localhost:5049`.  
Swagger UI available at `http://localhost:5049/swagger`.

### Run the Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Run Tests

**Backend (xUnit):**

```bash
cd server-tests
dotnet test
```

**Frontend (Vitest):**

```bash
cd client
npm test
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculator/calculate` | Evaluate expression (operands[], operators[]) with precedence |
| GET | `/api/calculator/memory` | Get current memory value |
| POST | `/api/calculator/memory/add` | Add value to memory |
| POST | `/api/calculator/memory/subtract` | Subtract value from memory |
| POST | `/api/calculator/memory/clear` | Clear memory (reset to 0) |

### Example Request

```json
POST /api/calculator/calculate
{
  "operands": [2, 3, 4],
  "operators": ["+", "*"]
}

Response: { "result": 14 }
```

## Architecture Highlights

- **Strategy Pattern** — Each arithmetic operation (`+`, `-`, `*`, `/`) is a separate class implementing `IOperation`. The calculator selects the correct strategy at runtime, following the Open/Closed Principle.
- **Chain of Responsibility** — Operator precedence is handled by a chain of `PrecedenceHandler` instances. High-precedence operators (`*`, `/`) are evaluated first, then low-precedence (`+`, `-`). Adding a new precedence level (e.g., exponentiation) requires only a new handler in the chain.
- **Exception Handling Middleware** — Global middleware catches all exceptions and returns ProblemDetails (RFC 7807) JSON responses, keeping controllers clean.
- **Dependency Injection** — All services registered via DI in `Program.cs`. `MemoryService` is Singleton (persists across requests, thread-safe with locking).
- **Startup Validation** — CORS origins validated at startup (fail-fast).
- **useReducer (Flux Pattern)** — Client state managed by a pure reducer function with discriminated union actions for full type safety.
- **useCalculator Hook** — Custom React hook separates all business logic from the UI component.
- **apiService** — All HTTP calls centralized in one file.

## Tests

```bash
cd server-tests
dotnet test
```

27 unit tests covering:
- **PrecedenceHandler** — operator precedence, complex expressions, division by zero, input immutability
- **CalculatorService** — single/multi-operator expressions, negatives, decimals
- **CalculationRequest validation** — operator count mismatch, unsupported operators, empty input
- **MemoryService** — add, subtract, clear, accumulation, thread-safety (concurrent access)
