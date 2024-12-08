package services

import "strings"

// PredefinedQueries holds a list of predefined SPARQL queries.
var PredefinedQueries = map[string]string{
	"all_resources": `
		SELECT ?s ?p ?o
		WHERE {
			?s ?p ?o
		} LIMIT 10`,
	"all_classes": `
		SELECT DISTINCT ?class
		WHERE {
			?s a ?class
		} LIMIT 10`,
	"resource_details": `
		SELECT ?p ?o
		WHERE {
			<{{RESOURCE}}> ?p ?o
		} LIMIT 10`,
}

// GetPredefinedQuery retrieves a predefined query by name, optionally replacing placeholders.
func GetPredefinedQuery(name string, placeholders map[string]string) (string, bool) {
	query, exists := PredefinedQueries[name]
	if !exists {
		return "", false
	}

	// Replace placeholders in the query
	for placeholder, value := range placeholders {
		query = replacePlaceholder(query, placeholder, value)
	}

	return query, true
}

// replacePlaceholder replaces a placeholder (e.g., {{RESOURCE}}) in a query with its value.
func replacePlaceholder(query, placeholder, value string) string {
	return strings.ReplaceAll(query, "{{"+placeholder+"}}", value)
}
