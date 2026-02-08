# Stage 1: Build
FROM golang:1.22.4 AS builder

WORKDIR /app

# Αντιγράφουμε τα go.mod και go.sum πρώτα (για caching)
COPY go.mod go.sum ./
RUN go mod download

# Αντιγράφουμε όλο τον κώδικα
COPY . .

# Πηγαίνουμε στον φάκελο που είναι το main.go
WORKDIR /app/cmd/api 


# Χτίζουμε το binary ΣΤΑΤΙΚΑ για να τρέχει στο Alpine
RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

# Stage 2: Runtime
FROM alpine:latest

# Προσθέτουμε πιστοποιητικά ασφαλείας (χρειάζονται για να κάνεις calls σε https)
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Αντιγράφουμε το binary από το builder stage
COPY --from=builder /app/cmd/api/backend .

# Ανοίγουμε την πόρτα
EXPOSE 8080

# Τρέχουμε το backend
CMD ["./backend"]