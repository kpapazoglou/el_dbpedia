# Use Golang image for building (updated version)
FROM golang:1.22.4 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy Go module files first to optimize caching
COPY go.mod go.sum ./

# Download dependencies before copying source code
RUN go mod download

# Copy backend source code
COPY . .

# Set working directory to where main.go is located
WORKDIR /app/cmd/api

# Build the backend binary
RUN go build -o backend .

# Use a minimal base image for final execution
FROM alpine:latest

# Set working directory in final container
WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /app/cmd/api/backend .

# Expose backend API port
EXPOSE 8080

# Set environment variables
ENV VIRTUOSO_ENDPOINT=http://store:8890/sparql
ENV PORT=8080

# Run the backend service
CMD ["./backend"]
