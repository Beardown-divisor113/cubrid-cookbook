# Rust Error Handling Examples

Focused examples for handling common CUBRID failures with `cubrid-tokio`.

## Files

- `01_connection_failure.rs` - handle unreachable server errors
- `02_constraint_violation.rs` - handle unique key violations
- `03_query_timeout.rs` - handle lock wait and timeout errors

## Run

```bash
cd /data/GitHub/cubrid-cookbook/rust/error-handling
cargo run --bin 01_connection_failure
cargo run --bin 02_constraint_violation
cargo run --bin 03_query_timeout
```
