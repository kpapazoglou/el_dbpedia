import { useState } from "react";
import Navbar from "./components/Navbar";
import QueryEditor from "./components/QueryEditor";
import PredefinedQueries from "./components/PredefinedQueries";
import ResultsTable from "./components/ResultsTable";
import QueryHistory from "./components/QueryHistory";

function App() {
  const [results, setResults] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const addToHistory = (query) => {
    setQueryHistory((prev) => {
      const updatedHistory = [query, ...prev.slice(0, 9)]; // Limit to 10
      localStorage.setItem("queryHistory", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };
  const handleSelectQuery = (query) => {
    setResults(null); // Clear results before running
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar />
      <h1 className="text-2xl font-bold text-center mb-4">DBpedia SPARQL Query Interface</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <QueryEditor onResults={setResults} addToHistory={addToHistory} />
        <PredefinedQueries onResults={setResults} />
        <QueryHistory onSelectQuery={handleSelectQuery} />
        <ResultsTable results={results} />
      </div>
    </div>
  );
}

export default App;