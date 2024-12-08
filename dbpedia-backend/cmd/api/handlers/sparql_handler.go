package handlers

import (
	"dbpedia-backend/cmd/api/services"
	"dbpedia-backend/cmd/api/utils"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
)

// SPARQLHandler handles SPARQL query requests.
func SPARQLHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the SPARQL query from the request body
	var requestBody struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		utils.HandleError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// validate the sparqk query
	if err := ValidateSPARQLQuery(requestBody.Query); err != nil {
		log.Printf("Validation error: %v", err)
		utils.HandleError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Execute the SPARQL query
	endpoint := "http://localhost:8080/sparql"
	//endpoint := "http://localhost:8890/sparql"
	result, err := services.ExecuteSPARQL(endpoint, requestBody.Query)
	if err != nil {
		utils.HandleError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the results as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(result))
}

// validate SparqlQuerry ensures the querry is noot empty and contains basic sparql keywords
func ValidateSPARQLQuery(query string) error {
	// Check if the query is empty
	if strings.TrimSpace(query) == "" {
		return errors.New("SPARQL query cannot be empty")
	}

	// Check for basic SPARQL structure (e.g., SELECT, ASK, DESCRIBE, or CONSTRUCT)
	if !(strings.Contains(strings.ToUpper(query), "SELECT") ||
		strings.Contains(strings.ToUpper(query), "ASK") ||
		strings.Contains(strings.ToUpper(query), "DESCRIBE") ||
		strings.Contains(strings.ToUpper(query), "CONSTRUCT")) {
		return errors.New("SPARQL query must contain SELECT, ASK, DESCRIBE, or CONSTRUCT")
	}

	return nil
}
