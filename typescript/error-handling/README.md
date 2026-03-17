# TypeScript Error Handling Examples

Focused examples for handling CUBRID client failures with explicit `try/catch` branches.

## Files

- `01_connection_failure.ts` - connection errors (`ConnectionError`)
- `02_constraint_violation.ts` - duplicate key query errors (`QueryError`)
- `03_query_timeout.ts` - lock timeout/query timeout patterns (`QueryError`)

## Run

```bash
cd /data/GitHub/cubrid-cookbook/typescript
npm install
npm run error:connection
npm run error:constraint
npm run error:timeout
```
