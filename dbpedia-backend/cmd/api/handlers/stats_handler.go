package handlers

import (
	"dbpedia-backend/cmd/api/services"
	"encoding/json"
	"net/http"
	"os"
	"sync"
	"time"
)

// DashboardStats: Η μορφή του JSON που θα στείλουμε στο React
type DashboardStats struct {
	TotalIslands     string `json:"total_islands"`
	TotalMuseums     string `json:"total_museums"`
	TotalTeams       string `json:"total_teams"`
	ProcessingTimeMs int64  `json:"processing_time_ms"`
}

// VirtuosoResponse: Βοηθητική δομή για να διαβάσουμε την απάντηση του Virtuoso
type VirtuosoResponse struct {
	Results struct {
		Bindings []struct {
			Count struct {
				Value string `json:"value"`
			} `json:"count"`
		} `json:"bindings"`
	} `json:"results"`
}

// GetDashboardStats: Ο Handler που τρέχει τα queries παράλληλα
func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	// 1. CORS Headers (Απαραίτητο για να μιλάει με το React)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Εύρεση του Endpoint (όπως και στον SPARQLHandler)
	endpoint := os.Getenv("VIRTUOSO_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://store:8890/sparql"
	}

	// 3. Τα Queries για καταμέτρηση (COUNT)
	// Χρησιμοποιούμε ?count για να ταιριάζει με το struct VirtuosoResponse
	queries := map[string]string{
		"islands": `SELECT (COUNT(?x) AS ?count) WHERE { ?x rdf:type dbo:Island . ?x rdfs:label ?name . FILTER(LANG(?name) = 'el') }`,
		"museums": `SELECT (COUNT(?x) AS ?count) WHERE { ?x rdf:type dbo:Museum . ?x rdfs:label ?name . FILTER(LANG(?name) = 'el') }`,
		"teams":   `SELECT (COUNT(?x) AS ?count) WHERE { ?x rdf:type dbo:SoccerClub . ?x rdfs:label ?name . FILTER(LANG(?name) = 'el') }`,
	}

	// 4. Αρχικοποίηση μεταβλητών για Concurrency
	var wg sync.WaitGroup
	var mu sync.Mutex // Κλειδαριά για να γράφουμε με ασφάλεια στο stats
	stats := DashboardStats{}

	start := time.Now() // Ξεκινάμε το χρονόμετρο

	wg.Add(3) // Περιμένουμε 3 εργασίες

	// --- GOROUTINE 1: Νησιά ---
	go func() {
		defer wg.Done()
		val := fetchCount(endpoint, queries["islands"])
		mu.Lock()
		stats.TotalIslands = val
		mu.Unlock()
	}()

	// --- GOROUTINE 2: Μουσεία ---
	go func() {
		defer wg.Done()
		val := fetchCount(endpoint, queries["museums"])
		mu.Lock()
		stats.TotalMuseums = val
		mu.Unlock()
	}()

	// --- GOROUTINE 3: Ομάδες ---
	go func() {
		defer wg.Done()
		val := fetchCount(endpoint, queries["teams"])
		mu.Lock()
		stats.TotalTeams = val
		mu.Unlock()
	}()

	// 5. Περιμένουμε να τελειώσουν ΟΛΑ
	wg.Wait()

	// Σταματάμε το χρονόμετρο
	stats.ProcessingTimeMs = time.Since(start).Milliseconds()

	// 6. Επιστροφή JSON στο Frontend
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// fetchCount: Βοηθητική συνάρτηση που εκτελεί το query και βγάζει το νούμερο
func fetchCount(endpoint, query string) string {
	// Καλούμε την υπάρχουσα συνάρτηση ExecuteSPARQL που έχεις ήδη
	jsonResult, err := services.ExecuteSPARQL(endpoint, query)
	if err != nil {
		return "0"
	}

	// Κάνουμε Parse το JSON για να βρούμε την τιμή
	var response VirtuosoResponse
	if err := json.Unmarshal([]byte(jsonResult), &response); err != nil {
		return "0"
	}

	if len(response.Results.Bindings) > 0 {
		return response.Results.Bindings[0].Count.Value
	}
	return "0"
}
