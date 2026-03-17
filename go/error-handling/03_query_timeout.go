package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/cubrid-labs/cubrid-go"
	cubrid "github.com/cubrid-labs/cubrid-go"
)

func main() {
	db, err := sql.Open("cubrid", "cubrid://dba:@localhost:33000/testdb")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Nanosecond)
	defer cancel()

	_, err = db.ExecContext(ctx, "SELECT 1")
	if err == nil {
		panic("expected timeout/deadline error")
	}

	if errors.Is(err, context.DeadlineExceeded) {
		fmt.Println("deadline exceeded handled via errors.Is")
	}

	var operationalErr *cubrid.OperationalError
	if errors.As(err, &operationalErr) {
		fmt.Printf("cubrid operational timeout via errors.As: code=%d message=%s\n", operationalErr.Code, operationalErr.Message)
	}

	fmt.Printf("raw error: %v\n", err)
}
