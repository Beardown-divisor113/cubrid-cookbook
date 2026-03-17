# Go Error Handling Examples

Focused examples for resilient CUBRID access with `cubrid-go` and the standard `errors` package.

## Files

- `01_connection_failure.go` - uses `errors.As` with network and `OperationalError` cases
- `02_constraint_violation.go` - uses `errors.As` + `errors.Is` for duplicate key handling
- `03_query_timeout.go` - uses `errors.Is` for context deadline and `errors.As` for driver errors

## Run

```bash
cd /data/GitHub/cubrid-cookbook/go/error-handling
go mod download
go run 01_connection_failure.go
go run 02_constraint_violation.go
go run 03_query_timeout.go
```
