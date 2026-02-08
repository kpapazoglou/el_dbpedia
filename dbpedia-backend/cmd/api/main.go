package main

import (
	"dbpedia-backend/cmd/api/handlers"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	// Create a new router
	router := mux.NewRouter()

	// Define a simple health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Backend is running"))
	}).Methods("GET")

	//Root route for basic health check or welcome message
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Welcome to the DBpedia Backend API")
	}).Methods("GET")

	// Register the SPARQL handler
	router.HandleFunc("/sparql", handlers.SPARQLHandler).Methods("POST", "GET", "OPTIONS")

	// Register the predefined queries handler
	router.HandleFunc("/predefined", handlers.PredefinedQueryHandler).Methods("POST", "GET", "OPTIONS")

	// Register the dashboard statts handler
	http.HandleFunc("/stats", handlers.GetDashboardStats)

	// Start the server
	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
