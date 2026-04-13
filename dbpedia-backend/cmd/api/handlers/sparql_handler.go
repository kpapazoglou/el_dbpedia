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
	"time"
	"fmt"
	"sync"
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
	startTime := time.Now()
	var wg sync.WaitGroup

	var dataResult string
	var countResult string
	var dataErr error

	// Ελέγχουμε αν το ερώτημα είναι SELECT για να κάνουμε το παράλληλο COUNT
	isSelect := strings.Contains(strings.ToUpper(sparqlQuery), "SELECT")

	// Goroutine 1: Φέρνει τα πραγματικά δεδομένα
	wg.Add(1)
	go func() {
		defer wg.Done()
		dataResult, dataErr = services.ExecuteSPARQL(endpoint, sparqlQuery)
	}()

	// Goroutine 2: Φέρνει ΠΑΡΑΛΛΗΛΑ το συνολικό Count (μόνο αν είναι SELECT)
	if isSelect {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// Δημιουργούμε ένα υπο-ερώτημα που μετράει το σύνολο - μετατροπη με το BuildCountQuery
			countQ := BuildCountQuery(sparqlQuery)
			countResult, _ = services.ExecuteSPARQL(endpoint, countQ)
		}()
	}

	// Η Go περιμένει να τελειώσουν ΚΑΙ ΤΑ ΔΥΟ νήματα!
	wg.Wait()
	executionTime := time.Since(startTime).Milliseconds()
	// =================================================================

	if dataErr != nil {
		utils.HandleError(w, dataErr.Error(), http.StatusInternalServerError)
		return
	}
	
	// --- 4. ΕΝΣΩΜΑΤΩΣΗ ΣΤΑΤΙΣΤΙΚΩΝ ΣΤΟ ΑΠΟΤΕΛΕΣΜΑ ---
	var jsonResponse map[string]interface{}
	if err := json.Unmarshal([]byte(dataResult), &jsonResponse); err == nil {
		
		stats := map[string]interface{}{
			"time_ms":            executionTime,
			"parallel_execution": isSelect,
		}

		// Αν το Goroutine 2 έφερε αποτέλεσμα, το διαβάζουμε
		if isSelect && countResult != "" {
			var cResp struct {
				Results struct {
					Bindings []map[string]struct{ Value string `json:"value"` } `json:"bindings"`
				} `json:"results"`
			}
			if json.Unmarshal([]byte(countResult), &cResp) == nil && len(cResp.Results.Bindings) > 0 {
				stats["total_db_rows"] = cResp.Results.Bindings[0]["total_count"].Value
			}
		}

		jsonResponse["concurrency_stats"] = stats
		
		finalBytes, _ := json.Marshal(jsonResponse)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(finalBytes)
		return
	}

	// Return the results as JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(dataResult))
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

// BuildCountQuery παίρνει ένα SPARQL ερώτημα και το μετατρέπει σωστά σε ερώτημα COUNT
func BuildCountQuery(originalQuery string) string {
	lines := strings.Split(originalQuery, "\n")
	var prefixes []string
	var body []string

	// 1. Διαχωρίζουμε τα PREFIX από το κυρίως σώμα
	for _, line := range lines {
		trimmedLine := strings.TrimSpace(line)
		if strings.HasPrefix(strings.ToUpper(trimmedLine), "PREFIX") {
			prefixes = append(prefixes, trimmedLine)
		} else {
			body = append(body, line)
		}
	}

	prefixString := strings.Join(prefixes, "\n")
	bodyString := strings.Join(body, "\n")

	// 2. Κόβουμε οτιδήποτε υπάρχει μετά την τελευταία αγκύλη "}" (όπως LIMIT, ORDER BY, OFFSET)
	lastBraceIdx := strings.LastIndex(bodyString, "}")
	if lastBraceIdx != -1 {
		// Κρατάμε το query μόνο μέχρι και την τελευταία αγκύλη
		bodyString = bodyString[:lastBraceIdx+1]
	}

	// 3. Ενώνουμε τα PREFIX στην κορυφή, και "τυλίγουμε" μόνο το καθαρό σώμα στο COUNT
	return fmt.Sprintf("%s\nSELECT (COUNT(*) AS ?total_count) WHERE { {\n%s\n} }", prefixString, bodyString)
}
