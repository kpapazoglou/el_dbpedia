package handlers

import (
	"dbpedia-backend/cmd/api/services"
	"dbpedia-backend/cmd/api/utils"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

func SPARQLHandler(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var sparqlQuery string
	if r.Method == "GET" {
		sparqlQuery = r.URL.Query().Get("query")
	} else {
		var requestBody struct {
			Query string `json:"query"`
		}
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			utils.HandleError(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		sparqlQuery = requestBody.Query
	}

	if err := ValidateSPARQLQuery(sparqlQuery); err != nil {
		utils.HandleError(w, err.Error(), http.StatusBadRequest)
		return
	}

	endpoint := os.Getenv("VIRTUOSO_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://store:8890/sparql"
	}

	// CONCURRENCY & TIMEOUT GUARD
	startTime := time.Now()
	var wg sync.WaitGroup

	var dataResult string
	var countResult string
	var dataErr error

	isSelect := strings.Contains(strings.ToUpper(sparqlQuery), "SELECT")

	// Goroutine 1: Δεδομένα
	wg.Add(1)
	go func() {
		defer wg.Done()
		dataResult, dataErr = services.ExecuteSPARQL(endpoint, sparqlQuery)
	}()

	// Goroutine 2: Παράλληλο Count
	if isSelect {
		wg.Add(1)
		go func() {
			defer wg.Done()
			countQ := BuildCountQuery(sparqlQuery)
			countResult, _ = services.ExecuteSPARQL(endpoint, countQ)
		}()
	}

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	// Περιμένουμε είτε να τελειώσουν όλα, είτε να περάσουν 5 δευτερόλεπτα
	select {
	case <-done:
		// Όλα ολοκληρώθηκαν κανονικά
	case <-time.After(5 * time.Second):
		// Ενεργοποίηση Timeout αν το ερώτημα αργεί πολύ
		log.Println("[TIMEOUT] Το background count query ακυρώθηκε λόγω καθυστέρησης.")
		if countResult == "" {
			countResult = "TIMEOUT_ERROR"
		}
	}

	executionTime := time.Since(startTime).Milliseconds()

	if dataErr != nil {
		utils.HandleError(w, dataErr.Error(), http.StatusInternalServerError)
		return
	}

	// Ενσωμάτωση στατιστικών
	var jsonResponse map[string]interface{}
	if err := json.Unmarshal([]byte(dataResult), &jsonResponse); err == nil {

		stats := map[string]interface{}{
			"time_ms":            executionTime,
			"parallel_execution": isSelect,
		}

		if isSelect {
			if countResult == "TIMEOUT_ERROR" {
				stats["total_db_rows"] = "TIMEOUT"
			} else if countResult != "" {
				var cResp struct {
					Results struct {
						Bindings []map[string]struct {
							Value string `json:"value"`
						} `json:"bindings"`
					} `json:"results"`
				}
				if json.Unmarshal([]byte(countResult), &cResp) == nil && len(cResp.Results.Bindings) > 0 {
					stats["total_db_rows"] = cResp.Results.Bindings[0]["total_count"].Value
				}
			}
		}

		jsonResponse["concurrency_stats"] = stats
		finalBytes, _ := json.Marshal(jsonResponse)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(finalBytes)
		return
	}

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
