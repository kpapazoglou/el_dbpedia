import { useState } from "react";
import Navbar from "./components/Navbar";
import QueryEditor from "./components/QueryEditor";
import PredefinedQueries from "./components/PredefinedQueries";
import ResultsTable from "./components/ResultsTable";
import QueryHistory from "./components/QueryHistory";
import { executeSPARQLQuery } from "./api/api"; 

function App() {
  const [results, setResults] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [currentQuery, setCurrentQuery] = useState(""); 
  
  // ΝΕΟ STATE: Κρατάει το μήνυμα λάθους του "Compiler"
  const [error, setError] = useState(null);

  const addToHistory = (query) => {
    setQueryHistory((prev) => {
      if (prev.length > 0 && prev[0] === query) return prev;
      const updatedHistory = [query, ...prev.slice(0, 9)];
      localStorage.setItem("queryHistory", JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const handleExecuteQuery = async (query) => {
    try {
      setResults(null); 
      setError(null); // Καθαρίζουμε τα παλιά λάθη πριν την εκτέλεση
      
      const data = await executeSPARQLQuery(query);
      setResults(data);
      addToHistory(query);
      
    } catch (err) {
      // Αν σκάσει λάθος, το βάζουμε στο state για να το δείξει ο Editor
      console.error("Query Error:", err);
      setError(err.message); 
    }
  };

  const handleSelectQuery = (query) => {
    setResults(null);
    setError(null); // Καθαρίζουμε τυχόν λάθη όταν επιλέγεις νέο query
    setCurrentQuery(query);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Περνάμε το 'error' στον Editor */}
            <QueryEditor 
               onExecute={handleExecuteQuery} 
               initialValue={currentQuery}
               errorMessage={error} 
            />
            
            {results && (
              <div className="mt-8">
                 <h3 className="text-lg font-bold text-[#003366] mb-2 border-b border-gray-300 pb-1">
                   Query Results
                 </h3>
                 <div className="bg-white border border-gray-300 rounded overflow-hidden">
                    <ResultsTable results={results} />
                 </div>
              </div>
            )}
          </div>

          <div className="space-y-6 bg-[#f9fafb] p-4 rounded border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-[#003366] uppercase mb-3 border-b border-gray-300 pb-1">
                Examples
              </h3>
              <PredefinedQueries onSelectQuery={handleSelectQuery} />
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-bold text-[#003366] uppercase mb-3 border-b border-gray-300 pb-1">
                History
              </h3>
              <QueryHistory onSelectQuery={handleSelectQuery} />
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#f5f5f5] border-t border-gray-300 py-4 text-center text-gray-600 text-sm mt-auto">
        &copy; 2026 DBpedia Greek Node
      </footer>
    </div>
  );
}

export default App;