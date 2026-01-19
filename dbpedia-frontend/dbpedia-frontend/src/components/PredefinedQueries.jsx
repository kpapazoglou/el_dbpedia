import React from "react";

const PredefinedQueries = ({ onSelectQuery }) => {
  
  const queries = [
    {
      label: "🇬🇷 Ελληνικά Νησιά",
      desc: "Με εικόνα, χάρτη και πληθυσμό.",
      query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT DISTINCT ?island ?name ?population ?image ?map WHERE {
  ?island rdf:type dbo:Island .
  ?island rdfs:label ?name .
  FILTER (LANG(?name) = 'el')
  
  {
    { ?island dbo:country <http://el.dbpedia.org/resource/Ελλάδα> }
    UNION
    { ?island dbo:location <http://el.dbpedia.org/resource/Ελλάδα> }
  }

  OPTIONAL { ?island dbo:populationTotal ?population }
  
  # --- IMAGE & MAP ---
  OPTIONAL { ?island dbo:thumbnail ?image }
  OPTIONAL { 
    ?island geo:lat ?lat ; geo:long ?lon .
    BIND(CONCAT("https://www.google.com/maps?q=", STR(?lat), ",", STR(?lon)) AS ?map)
  }
} ORDER BY DESC(?population) LIMIT 50`
    },
    {
      label: "🏛️ Μουσεία (Ελλάδα)",
      desc: "Με εικόνα, χάρτη και περιγραφή.",
      query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT DISTINCT ?museum ?name ?image ?map ?info WHERE {
  ?museum rdf:type dbo:Museum .
  ?museum rdfs:label ?name .
  FILTER (LANG(?name) = 'el')

  ?museum dbo:abstract ?abstract .
  FILTER (LANG(?abstract) = 'el')

  FILTER (
    CONTAINS(LCASE(?abstract), "ελλάδα") || 
    CONTAINS(LCASE(?abstract), "αθήνα") || 
    CONTAINS(LCASE(?abstract), "θεσσαλονίκη") ||
    CONTAINS(LCASE(?abstract), "κρήτη") ||
    CONTAINS(LCASE(?abstract), "αρχαιολογικό")
  )
  BIND(?abstract AS ?info)

  # --- IMAGE & MAP ---
  OPTIONAL { ?museum dbo:thumbnail ?image }
  OPTIONAL { 
    ?museum geo:lat ?lat ; geo:long ?lon .
    BIND(CONCAT("https://www.google.com/maps?q=", STR(?lat), ",", STR(?lon)) AS ?map)
  }
} LIMIT 50`
    },
    {
      label: "⚽ Ελληνικές Ομάδες",
      desc: "Με σήμα ομάδας (όπου υπάρχει) και πληροφορίες.",
      query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT DISTINCT ?team ?name ?image ?map ?info WHERE {
  ?team rdf:type dbo:SoccerClub .
  ?team rdfs:label ?name .
  FILTER (LANG(?name) = 'el')

  ?team dbo:abstract ?abstract .
  FILTER (LANG(?abstract) = 'el')

  FILTER (
     CONTAINS(LCASE(?abstract), "ελληνική") || 
     CONTAINS(LCASE(?abstract), "ελλάδα") || 
     CONTAINS(LCASE(?abstract), "αθήνα") || 
     CONTAINS(LCASE(?abstract), "θεσσαλονίκη") || 
     CONTAINS(LCASE(?abstract), "παε") ||
     CONTAINS(LCASE(?abstract), "σούπερ λιγκ")
  )
  BIND(?abstract AS ?info)

  # --- IMAGE & MAP ---
  OPTIONAL { ?team dbo:thumbnail ?image }
  OPTIONAL { 
    ?team geo:lat ?lat ; geo:long ?lon .
    BIND(CONCAT("https://www.google.com/maps?q=", STR(?lat), ",", STR(?lon)) AS ?map)
  }
} LIMIT 50`
    },
    {
      label: "📜 Αρχαίοι Φιλόσοφοι",
      desc: "Με εικόνα (προτομή/άγαλμα) και βιογραφικό.",
      query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?name ?image ?info WHERE {
  ?philosopher a dbo:Philosopher .
  ?philosopher rdfs:label ?name .
  FILTER (LANG(?name) = 'el')

  ?philosopher dbo:abstract ?abstract .
  FILTER (LANG(?abstract) = 'el')
  
  FILTER (CONTAINS(LCASE(?abstract), "έλληνας") || CONTAINS(LCASE(?abstract), "ελληνίδα") || CONTAINS(LCASE(?abstract), "αθηναίος"))
  BIND(?abstract AS ?info)

  # --- IMAGE ONLY (Δεν έχουν χάρτη συνήθως) ---
  OPTIONAL { ?philosopher dbo:thumbnail ?image }
} LIMIT 20`
    },
    {
      label: "🔬 Ελληνικά Πανεπιστήμια",
      desc: "Με λογότυπο (αν υπάρχει) και τοποθεσία.",
      query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT DISTINCT ?uni ?name ?image ?map ?info WHERE {
  ?uni rdf:type dbo:University .
  ?uni rdfs:label ?name .
  FILTER (LANG(?name) = 'el')
  
  ?uni dbo:country <http://el.dbpedia.org/resource/Ελλάδα> .
  
  OPTIONAL {
    ?uni dbo:abstract ?abstract .
    FILTER (LANG(?abstract) = 'el')
  }
  BIND(?abstract AS ?info)

  # --- IMAGE & MAP ---
  OPTIONAL { ?uni dbo:thumbnail ?image }
  OPTIONAL { 
    ?uni geo:lat ?lat ; geo:long ?lon .
    BIND(CONCAT("https://www.google.com/maps?q=", STR(?lat), ",", STR(?lon)) AS ?map)
  }
} LIMIT 20`
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      {queries.map((q, index) => (
        <button
          key={index}
          onClick={() => onSelectQuery(q.query)}
          className="text-left group bg-white hover:bg-[#f0f4f8] border border-gray-300 hover:border-[#003366] rounded p-3 transition-all duration-200 shadow-sm"
        >
          <div className="font-bold text-[#003366] text-sm group-hover:text-[#002244]">
            {q.label}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {q.desc}
          </div>
        </button>
      ))}
    </div>
  );
};

export default PredefinedQueries;