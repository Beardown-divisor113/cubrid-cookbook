package main

import (
	"database/sql"
	"errors"
	"fmt"
	"net"

	_ "github.com/cubrid-labs/cubrid-go"
	cubrid "github.com/cubrid-labs/cubrid-go"
)

func main() {
	db, err := sql.Open("cubrid", "cubrid://dba:@127.0.0.1:44444/testdb")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	err = db.Ping()
	if err == nil {
		panic("expected connection failure but ping succeeded")
	}

	var opErr *net.OpError
	if errors.As(err, &opErr) {
		fmt.Printf("network error via errors.As: %v\n", opErr)
	}

	var cubridOpErr *cubrid.OperationalError
	if errors.As(err, &cubridOpErr) {
		fmt.Printf("cubrid operational error via errors.As: code=%d message=%s\n", cubridOpErr.Code, cubridOpErr.Message)
	}
}
