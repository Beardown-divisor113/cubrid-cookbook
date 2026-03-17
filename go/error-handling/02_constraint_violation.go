package main

import (
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/cubrid-labs/cubrid-go"
	cubrid "github.com/cubrid-labs/cubrid-go"
)

var ErrDuplicateKey = errors.New("duplicate key")

func classifyConstraintError(err error) error {
	if err == nil {
		return nil
	}

	var integrityErr *cubrid.IntegrityError
	if errors.As(err, &integrityErr) {
		return fmt.Errorf("%w: code=%d message=%s", ErrDuplicateKey, integrityErr.Code, integrityErr.Message)
	}

	return err
}

func main() {
	db, err := sql.Open("cubrid", "cubrid://dba:@localhost:33000/testdb")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if _, err := db.Exec("DROP TABLE IF EXISTS cookbook_error_users"); err != nil {
		panic(err)
	}
	defer db.Exec("DROP TABLE IF EXISTS cookbook_error_users")

	if _, err := db.Exec(`
		CREATE TABLE cookbook_error_users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(200) UNIQUE NOT NULL
		)
	`); err != nil {
		panic(err)
	}

	if _, err := db.Exec("INSERT INTO cookbook_error_users (email) VALUES (?)", "alice@example.com"); err != nil {
		panic(err)
	}

	_, err = db.Exec("INSERT INTO cookbook_error_users (email) VALUES (?)", "alice@example.com")
	classified := classifyConstraintError(err)
	if errors.Is(classified, ErrDuplicateKey) {
		fmt.Printf("duplicate key handled via errors.Is: %v\n", classified)
		return
	}

	panic("expected duplicate key error")
}
