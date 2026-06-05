# AI Studio Frontend

React + TypeScript + Vite frontend for AI Studio (OpenWebUI-like application).

## Setup

### Requirements

- Node.js 18+
- Bun (package manager)

### Installation

1. Install dependencies using Bun:

```bash
bun install
```

2. Create `.env` file from template:

```bash
cp .env.example .env
```

3. Update `.env` with your API configuration.

## Running

### Development

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Code Quality

### Linting

```bash
bun run lint
```

### Type Checking

```bash
bun run type-check
```

## Project Structure

```
src/
├── api/              # API client and endpoints
│   └── client.ts
├── components/       # Reusable React components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Development

### Add New Dependencies

```bash
bun add package-name
```

### Add Dev Dependencies

```bash
bun add -d package-name
```

## Features

- React 18 with TypeScript
- Vite for fast development and building
- Axios for HTTP requests
- Configured proxy for API calls
- ESLint and TypeScript for code quality

## License

MIT
