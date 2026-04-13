import { useState } from "react";
import Navbar from "./components/Navbar";
import QueryEditor from "./components/QueryEditor";
import PredefinedQueries from "./components/PredefinedQueries";
import ResultsTable from "./components/ResultsTable";
import QueryHistory from "./components/QueryHistory";
import StatsDashboard from './components/StatsDashboard';
import { executeSPARQLQuery } from "./api/api"; 

function App() {
  const [results, setResults] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [currentQuery, setCurrentQuery] = useState(""); 
  const [error, setError] = useState(null);
  
  
  const [queryStats, setQueryStats] = useState(null);

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
      setError(null); 
      setQueryStats(null); // Καθαρίζουμε τα παλιά στατιστικά
      
      const data = await executeSPARQLQuery(query);
      
      
      if (!data || typeof data !== 'object' || !data.head || !data.results) {
          throw new Error("Ο server επέστρεψε μη έγκυρα δεδομένα. Πιθανό συντακτικό λάθος στο SPARQL.");
      }
      
      const rowCount = data.results?.bindings?.length || 0;
      
      // Διαβάζουμε τα στατιστικά της ταυτοχρονίας (Goroutines) από τη Go
      const backendStats = data.concurrency_stats || {};

      setResults(data);
      
      // Αποθηκεύουμε τα στατιστικά στο React State
      setQueryStats({
          rows: rowCount,
          time: backendStats.time_ms || 0,
          total_db: backendStats.total_db_rows,
          isParallel: backendStats.parallel_execution
      });

      addToHistory(query);
      
    } catch (err) {
      console.error("Query Error:", err);
      setError(err.message); 
    }
  };

  const handleSelectQuery = (query) => {
    setResults(null);
    setError(null);
    setQueryStats(null);
    setCurrentQuery(query);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 space-y-8">
        
        <StatsDashboard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <QueryEditor 
               onExecute={handleExecuteQuery} 
               initialValue={currentQuery}
               errorMessage={error} 
            />
            
            {results && (
              <div className="mt-8">
                 <div className="flex justify-between items-end mb-2 border-b border-gray-300 pb-1">
                     <h3 className="text-lg font-bold text-[#003366]">
                       Query Results
                     </h3>
                     
                     {/* ΕΜΦΑΝΙΣΗ ΣΤΑΤΙΣΤΙΚΩΝ   */}
                     {queryStats && (
                         <div className="flex space-x-3 text-[11px] font-mono text-gray-700 bg-[#f8fafc] px-3 py-1.5 rounded border border-gray-300 shadow-sm items-center">
                             
                             {queryStats.isParallel && (
                                 <span className="flex items-center text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">
                                     <span className="mr-1 animate-pulse">⚡</span> Parallel
                                 </span>
                             )}

                             <span className="flex items-center">
                                 Time: <strong className="text-indigo-700 ml-1">{queryStats.time} ms</strong>
                             </span>
                             
                             <span className="text-gray-300">|</span>
                             
                             <span className="flex items-center">
                                 Returned Rows: <strong className="text-emerald-700 ml-1">{queryStats.rows}</strong>
                             </span>

                             {queryStats.total_db && (
                                 <>
                                     <span className="text-gray-300">|</span>
                                     <span className="flex items-center">
                                         Total in DB: <strong className="text-amber-600 ml-1">{queryStats.total_db}</strong>
                                     </span>
                                 </>
                             )}
                         </div>
                     )}
                 </div>

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