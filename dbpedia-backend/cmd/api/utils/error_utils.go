package utils

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse represents a standardized error response.
type ErrorResponse struct {
	Message string `json:"message"`
}

// HandleError sends a JSON-formatted error response.
func HandleError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(ErrorResponse{Message: message})
}
