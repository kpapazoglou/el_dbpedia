package handlers

import (
	"dbpedia-backend/cmd/api/services"
	"dbpedia-backend/cmd/api/utils"
	"log"
	"net/http"
)

// PredefinedQueryHandler handles requests for predefined SPARQL queries.
func PredefinedQueryHandler(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	queryName := r.URL.Query().Get("query")
	if queryName == "" {
		utils.HandleError(w, "Query parameter is required", http.StatusBadRequest)
		return
	}

	// Log the query name for debugging
	log.Printf("Predefined query received: %s", queryName)

	// Fetch the predefined query
	query, exists := services.GetPredefinedQuery(queryName, nil)
	if !exists {
		utils.HandleError(w, "Query not found", http.StatusNotFound)
		return
	}

	// Execute the query
	endpoint := "http://localhost:8890/sparql"
	result, err := services.ExecuteSPARQL(endpoint, query)
	if err != nil {
		utils.HandleError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the results as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(result))
}
