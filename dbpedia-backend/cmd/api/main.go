package main

import (
	"dbpedia-backend/cmd/api/handlers"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// Η main  στοχος μας να σηκωσει εναν HTTP server που θα εξυπηρετεί τα αιτήματα προς το backend.
// Θα χρησιμοποιήσουμε το Gorilla Mux για να διαχειριστούμε τα routes και να κατευθύνουμε τα αιτήματα στους κατάλληλους handlers.
func main() {
	//δρομολογητης για να διαχειριστεί τα αιτήματα
	router := mux.NewRouter()

	//health check endpoint -->test
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Backend is running"))
	}).Methods("GET")

	//Root route for basic health check or welcome message -> test
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Welcome to the DBpedia Backend API")
	}).Methods("GET")

	// Register the SPARQL handler
	router.HandleFunc("/sparql", handlers.SPARQLHandler).Methods("POST", "GET", "OPTIONS")

	// Register the predefined queries handler
	router.HandleFunc("/predefined", handlers.PredefinedQueryHandler).Methods("POST", "GET", "OPTIONS")

	// Register the dashboard stats handler
	http.HandleFunc("/stats", handlers.GetDashboardStats)

	// Start the server
	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
