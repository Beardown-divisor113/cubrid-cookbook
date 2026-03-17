# TypeScript + CUBRID Examples

TypeScript-first CUBRID examples using `cubrid-client` with runnable scripts and focused error handling.

## Quick Start with Docker

```bash
cd /data/GitHub/cubrid-cookbook/typescript
docker compose up --build
```

This starts:

- `cubrid` on `localhost:33000`
- `app` container that runs `npm run connect`

## Setup

```bash
cd /data/GitHub/cubrid-cookbook/typescript
npm install
```

## Run

```bash
npm run connect
```

## Error Handling

See `error-handling/` for copy-pasteable `try/catch` patterns:

- `01_connection_failure.ts`
- `02_constraint_violation.ts`
- `03_query_timeout.ts`

Run them with:

```bash
npm run error:connection
npm run error:constraint
npm run error:timeout
```
