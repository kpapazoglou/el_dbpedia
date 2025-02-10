import { useState } from "react";
import { executeSPARQLQuery } from "../api/api";
import { Controlled as CodeMirror } from "@uiw/react-codemirror";
import { sparql } from "@codemirror-graphql/sparql";
const QueryEditor = ({ onResults, addToHistory }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await executeSPARQLQuery(query);
      onResults(results);
      addToHistory(query); // Save query to history
    } catch (error) {
      console.error("SPARQL Error:", error);
      onResults({ error: "Query failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <CodeMirror
        value={query}
        height="150px"
        extensions={[sparql()]}
        onChange={(value) => setQuery(value)}
        className="border rounded"
      />
      <button
        className={`mt-3 px-4 py-2 text-white rounded ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Query"}
      </button>
    </div>
  );
};

export default QueryEditor;