# 🧮 Web Calculator with Memory

Full Stack web calculator with memory functions, built as a coding assignment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | ASP.NET Core Web API (.NET 8) |
| **Frontend** | React + TypeScript + Vite |
| **Design Patterns** | Strategy Pattern, Exception Handling Middleware |

## Features

- Basic arithmetic: `+`, `-`, `*`, `/`
- Memory operations: `M` (recall), `+M` (add to memory), `-M` (subtract from memory)
- Server-side calculation and memory storage
- Global error handling (division by zero, invalid operators)
- Modern dark UI, responsive design

## Project Structure

```
Calculator/
├── server/                    # ASP.NET Core Web API
│   ├── Controllers/           # REST API endpoints
│   ├── Services/              # Business logic (Calculator + Memory)
│   ├── Operations/            # Strategy Pattern (IOperation implementations)
│   ├── Middleware/             # Global exception handling
│   ├── Models/                # Request/Response DTOs
│   └── Program.cs             # DI, CORS, Swagger, Middleware config
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
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/calculator/calculate` | Perform arithmetic (operand1, operand2, operator) |
| GET | `/api/calculator/memory/get` | Get current memory value |
| POST | `/api/calculator/memory/add` | Add value to memory |
| POST | `/api/calculator/memory/subtract` | Subtract value from memory |

### Example Request

```json
POST /api/calculator/calculate
{
  "operand1": 10,
  "operand2": 3,
  "operator": "+"
}

Response: { "result": 13 }
```

## Architecture Highlights

- **Strategy Pattern** — Each arithmetic operation (`+`, `-`, `*`, `/`) is a separate class implementing `IOperation`. The calculator service selects the correct strategy at runtime, following the Open/Closed Principle.
- **Exception Handling Middleware** — Global middleware catches all exceptions and returns uniform JSON error responses, keeping controllers clean.
- **Dependency Injection** — `CalculatorService` (Transient) and `MemoryService` (Singleton) registered via DI in `Program.cs`.
- **useCalculator Hook** — Custom React hook separates all business logic from the UI component.
- **apiService** — All HTTP calls centralized in one file.
