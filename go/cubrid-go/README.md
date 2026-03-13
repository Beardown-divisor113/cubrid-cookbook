# cubrid-go Examples

Direct CUBRID access from Go using the [cubrid-go](https://github.com/cubrid-labs/cubrid-go) driver with Go's standard `database/sql` package.

## Features

- Standard `database/sql` API (`sql.Open`, `Query`, `Exec`, `Begin`)
- `?` placeholders for safe, parameterized queries
- Full CRUD flow with formatted result output
- Explicit transaction control with `Commit()` and `Rollback()`
- Self-contained scripts that create tables, run demos, and clean up

## Prerequisites

- Go 1.21+
- CUBRID running on `localhost:33000` with database `testdb`

The root project Docker Compose provides CUBRID. Start from the repository root:

```bash
make up
```

## Setup

```bash
go mod download
```

## Examples

| File | Topic | Key Concepts |
|------|-------|--------------|
| `01_connect.go` | Connecting to CUBRID | `sql.Open()`, `Ping()`, `QueryRow()`, connection metadata |
| `02_crud.go` | CRUD operations | CREATE TABLE, INSERT/SELECT/UPDATE/DELETE, `?` parameters |
| `03_transactions.go` | Transaction control | `db.Begin()`, `tx.Commit()`, `tx.Rollback()`, atomic multi-statement changes |

## Run

```bash
go run 01_connect.go
go run 02_crud.go
go run 03_transactions.go
```

Each script is self-contained — it creates its own tables, runs examples, and cleans up.

## Code Highlights

### Connecting to CUBRID

```go
package main

import (
    "database/sql"
    _ "github.com/cubrid-labs/cubrid-go"
)

func main() {
    db, _ := sql.Open("cubrid", "cubrid://dba:@localhost:33000/testdb")
    defer db.Close()

    var result int
    _ = db.QueryRow("SELECT 1 + 1 AS result").Scan(&result)
}
```

### CRUD with Parameterized Queries

```go
_, _ = db.Exec(
    "INSERT INTO cookbook_users (name, email, age) VALUES (?, ?, ?)",
    "Alice", "alice@example.com", 30,
)

rows, _ := db.Query(
    "SELECT name, age FROM cookbook_users WHERE age >= ?",
    30,
)
defer rows.Close()
```

### Transactions

```go
tx, _ := db.Begin()

_, _ = tx.Exec(
    "UPDATE cookbook_accounts SET balance = balance - ? WHERE name = ?",
    200.0, "Alice",
)
_, _ = tx.Exec(
    "UPDATE cookbook_accounts SET balance = balance + ? WHERE name = ?",
    200.0, "Bob",
)

_ = tx.Commit()
```

## Expected Output

Running `01_connect.go`:

```
=== Basic Connection ===
1 + 1 = 2

=== Connection Info ===
CUBRID version: 11.2.0.0338
Database: testdb
User: DBA

=== Multiple Queries ===
SELECT 1 AS a                       -> 1
SELECT 'hello' AS b                 -> hello
SELECT CURRENT_DATE AS today        -> 2025-01-15
```

Running `03_transactions.go`:

```
=== Commit Example ===
  Balances (before): Alice=$1000.00, Bob=$500.00
  ✓ Transferred $200.00 from Alice to Bob
  Balances (after commit): Alice=$800.00, Bob=$700.00

=== Rollback Example ===
  Balances (before): Alice=$800.00, Bob=$700.00
  Made Alice's balance = 0 (within transaction)
  ✓ Transaction rolled back
  Balances (after rollback): Alice=$800.00, Bob=$700.00
```

## API Quick Reference

| Method | Description |
|--------|-------------|
| `sql.Open(driver, dsn)` | Open a reusable DB handle |
| `db.Ping()` | Verify connection to CUBRID |
| `db.QueryRow(sql, args...).Scan(...)` | Fetch one row/value |
| `db.Query(sql, args...)` | Execute query returning rows |
| `db.Exec(sql, args...)` | Execute statement without row result |
| `db.Begin()` | Start a transaction |
| `tx.Commit()` / `tx.Rollback()` | Complete or revert transaction |
| `rows.Close()` | Release result set resources |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `sql: unknown driver "cubrid"` | Run `go mod download` and ensure blank import `_ "github.com/cubrid-labs/cubrid-go"` exists |
| Connection refused to `localhost:33000` | Ensure CUBRID is running: `make up` from repo root |
| `UNIQUE violation` on `email` | Use unique values or update existing rows instead of inserting duplicates |
| Query parameters not binding | Use `?` placeholders and pass parameters as extra arguments |

## Learn More

- [cubrid-go repository](https://github.com/cubrid-labs/cubrid-go)
- [Go `database/sql` package](https://pkg.go.dev/database/sql)
- [CUBRID SQL Guide](https://www.cubrid.org/manual/en/11.2/sql/index.html)
