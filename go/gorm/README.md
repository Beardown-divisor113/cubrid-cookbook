# GORM + CUBRID Examples

Practical CUBRID access from Go using GORM with the official CUBRID dialector from [cubrid-go](https://github.com/cubrid-labs/cubrid-go).

## Features

- AutoMigrate-based schema setup for CUBRID tables
- CRUD operations with `Create`, `Find`, `Where`, `First`, `Update`, and `Delete`
- Transaction control with `db.Transaction()` and manual `Begin/Commit/Rollback`
- One-to-many relationships with `Preload()` and JOIN queries

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

## Quick Start with Docker

```bash
cd /data/GitHub/cubrid-cookbook/go
docker compose up --build
```

This runs CUBRID plus a Go container that executes `go/cubrid-go/01_connect.go`.

## Examples

| File | Topic | Key Concepts |
|------|-------|--------------|
| `01_connect.go` | Connecting to CUBRID | `gorm.Open`, cubrid dialector, logger config, raw SQL, connection metadata |
| `02_crud.go` | CRUD operations | `AutoMigrate`, `Create`, `Find`, `Where`, `First`, `Model().Update`, `Delete` |
| `03_transactions.go` | Transaction control | `db.Transaction`, rollback on error, manual `Begin/Commit/Rollback` |
| `04_relationships.go` | Relationships | one-to-many models, foreign keys, `Preload`, JOIN queries |

## Run

```bash
go run 01_connect.go
go run 02_crud.go
go run 03_transactions.go
go run 04_relationships.go
```

Each script is self-contained — it creates its own tables, runs examples, and cleans up.

## Code Highlights

### Connect with GORM + CUBRID

```go
package main

import (
	"log"

	cubrid "github.com/cubrid-labs/cubrid-go/dialector"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(cubrid.Open("cubrid://dba:@localhost:33000/testdb"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	var row struct{ Result int }
	if err := db.Raw("SELECT 1 + 1 AS result").Scan(&row).Error; err != nil {
		log.Fatal(err)
	}
}
```

### AutoMigrate + CRUD

```go
type CookbookUser struct {
	ID    uint   `gorm:"primaryKey;autoIncrement"`
	Name  string `gorm:"size:100;not null"`
	Email string `gorm:"size:200;uniqueIndex"`
	Age   int    `gorm:"default:0"`
}

func (CookbookUser) TableName() string { return "cookbook_users" }

_ = db.AutoMigrate(&CookbookUser{})
_ = db.Create(&CookbookUser{Name: "Alice", Email: "alice@example.com", Age: 30}).Error
_ = db.Where("age >= ?", 30).Find(&[]CookbookUser{}).Error
```

### Transactions

```go
err := db.Transaction(func(tx *gorm.DB) error {
	if err := tx.Model(&CookbookAccount{}).Where("name = ?", "Alice").
		Update("balance", gorm.Expr("balance - ?", 200)).Error; err != nil {
		return err
	}
	if err := tx.Model(&CookbookAccount{}).Where("name = ?", "Bob").
		Update("balance", gorm.Expr("balance + ?", 200)).Error; err != nil {
		return err
	}
	return nil
})
if err != nil {
	log.Fatal(err)
}
```

### Relationships + Preload

```go
var authors []CookbookAuthor
if err := db.Preload("Books").Find(&authors).Error; err != nil {
	log.Fatal(err)
}

var rows []struct {
	Title      string
	AuthorName string
}
_ = db.Table("cookbook_books AS b").
	Select("b.title AS title, a.name AS author_name").
	Joins("JOIN cookbook_authors AS a ON a.id = b.cookbook_author_id").
	Find(&rows).Error
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
  ✓ Transaction rolled back automatically on error
  Balances (after rollback): Alice=$800.00, Bob=$700.00

=== Manual Transaction ===
  Balances (before): Alice=$800.00, Bob=$700.00
  Applied bonuses: Alice +$100, Bob +$50
  Balances (after manual commit): Alice=$900.00, Bob=$750.00
```

## API Quick Reference

| Method | Description |
|--------|-------------|
| `gorm.Open(cubrid.Open(dsn), &gorm.Config{})` | Open a CUBRID database with GORM |
| `db.AutoMigrate(&Model{})` | Create/adjust table schema for model |
| `db.Create(&value)` | Insert one or more rows |
| `db.Find(&slice)` | Query all matching rows |
| `db.Where(...).First(&value)` | Query first matching row |
| `db.Model(&Model{}).Update(column, value)` | Update rows with conditions |
| `db.Delete(&Model{}, conditions...)` | Delete rows |
| `db.Transaction(func(tx *gorm.DB) error { ... })` | Run transactional logic with auto commit/rollback |
| `db.Preload("Books").Find(&authors)` | Eager load related rows |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `failed to connect to database` | Ensure CUBRID is running: `make up` from repository root |
| `missing go.sum entry` | Run `go mod download` in this directory |
| `Error 1265: Data truncated` | Check struct field types and tags against table definitions |
| `duplicate key` errors on rerun | Ensure cleanup succeeds or drop tables manually |

## Error Handling

For focused `errors.Is` / `errors.As` patterns with `cubrid-go`, see:

- `/data/GitHub/cubrid-cookbook/go/error-handling/`

## Learn More

- [cubrid-go repository](https://github.com/cubrid-labs/cubrid-go)
- [GORM documentation](https://gorm.io/docs/)
- [CUBRID SQL Guide](https://www.cubrid.org/manual/en/11.2/sql/index.html)
