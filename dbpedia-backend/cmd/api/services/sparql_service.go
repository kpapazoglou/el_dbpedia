package services

import (
	"bytes"
	"errors"
	"io"
	"log"
	"net/http"
	"time"
)

// ExecuteSPARQL sends a SPARQL query to the Virtuoso endpoint and returns the results or an error.
func ExecuteSPARQL(endpoint string, query string) (string, error) {

	start := time.Now()

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer([]byte(query)))
	if err != nil {
		log.Printf("Error creating SPARQL request: %v", err)
		return "", errors.New("failed to create SPARQL request")
	}

	// Set necessary headers
	req.Header.Set("Content-Type", "application/sparql-query")

	// --- Η ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΕΔΩ ---
	// Λέμε στο Virtuoso: "Στείλε μου την απάντηση σε JSON, όχι XML"
	req.Header.Set("Accept", "application/sparql-results+json")

	// Log the SPARQL query
	log.Printf("Executing SPARQL query: %s", query)

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error executing SPARQL request: %v", err)
		return "", errors.New("failed to execute SPARQL query")
	}
	defer resp.Body.Close()

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body) // Διαβάζουμε το body για να δούμε το λάθος
		log.Printf("SPARQL endpoint returned status %d: %s. Body: %s", resp.StatusCode, resp.Status, string(bodyBytes))
		return "", errors.New("SPARQL endpoint returned an error: " + resp.Status)
	}

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading SPARQL response body: %v", err)
		return "", errors.New("failed to read SPARQL response")
	}

	// Log query execution time
	duration := time.Since(start)
	log.Printf("SPARQL query executed in %v", duration)

	return string(body), nil
}

/*
Example log output:
024/11/27 12:00:00 Started POST /sparql from 127.0.0.1:60000
2024/11/27 12:00:00 Executing SPARQL query: SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10
2024/11/27 12:00:01 SPARQL query executed in 1.002s
2024/11/27 12:00:01 Completed 200 OK in 1.002s
*/
