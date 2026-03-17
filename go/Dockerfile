FROM golang:1.22

WORKDIR /app/cubrid-go

COPY cubrid-go/go.mod ./go.mod
RUN go mod download

COPY cubrid-go/. ./

CMD ["go", "run", "01_connect.go"]
