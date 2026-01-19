package handlers

import (
	"dbpedia-backend/cmd/api/services"
	"dbpedia-backend/cmd/api/utils"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
)

// SPARQLHandler handles SPARQL query requests.
func SPARQLHandler(w http.ResponseWriter, r *http.Request) {
	// --- 1. ΠΡΟΣΘΗΚΗ: CORS Headers (Απαραίτητο για React) ---
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// --- 2. ΠΡΟΣΘΗΚΗ: Διαχείριση OPTIONS (Pre-flight check) ---
	// Αν είναι OPTIONS, σταματάμε εδώ με OK (δεν πάμε να διαβάσουμε JSON)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var sparqlQuery string

	// --- 3. ΠΡΟΣΘΗΚΗ: Υποστήριξη GET (για browser) και POST (για React) ---
	if r.Method == "GET" {
		// Αν είναι GET, διαβάζουμε από το URL
		sparqlQuery = r.URL.Query().Get("query")
	} else {
		// Αν είναι POST, διαβάζουμε το JSON
		var requestBody struct {
			Query string `json:"query"`
		}
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			utils.HandleError(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		sparqlQuery = requestBody.Query
	}

	// Validate the SPARQL query
	if err := ValidateSPARQLQuery(sparqlQuery); err != nil {
		log.Printf("Validation error: %v", err)
		utils.HandleError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get SPARQL endpoint from environment variable
	endpoint := os.Getenv("VIRTUOSO_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://store:8890/sparql" // Default to Docker network service
	}

	// Execute the SPARQL query
	// Χρησιμοποιούμε το sparqlQuery που βρήκαμε (είτε από GET είτε από POST)
	result, err := services.ExecuteSPARQL(endpoint, sparqlQuery)
	if err != nil {
		utils.HandleError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the results as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(result))
}

// ValidateSPARQLQuery ensures the query is not empty and contains basic SPARQL keywords
func ValidateSPARQLQuery(query string) error {
	// Check if the query is empty
	if strings.TrimSpace(query) == "" {
		return errors.New("SPARQL query cannot be empty")
	}

	// Check for basic SPARQL structure
	upperQuery := strings.ToUpper(query)
	if !(strings.Contains(upperQuery, "SELECT") ||
		strings.Contains(upperQuery, "ASK") ||
		strings.Contains(upperQuery, "DESCRIBE") ||
		strings.Contains(upperQuery, "CONSTRUCT")) {
		return errors.New("SPARQL query must contain SELECT, ASK, DESCRIBE, or CONSTRUCT")
	}

	return nil
}
