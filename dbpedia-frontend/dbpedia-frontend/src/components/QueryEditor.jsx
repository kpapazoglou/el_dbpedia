import { useState, useEffect } from "react";

// Προσθέσαμε το prop 'errorMessage'
const QueryEditor = ({ onExecute, initialValue, errorMessage }) => {
  const [query, setQuery] = useState(
    "SELECT * WHERE { ?s ?p ?o } LIMIT 10"
  );

  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onExecute) {
      onExecute(query);
    }
  };

  return (
    <div className="bg-[#f5f7f9] p-4 rounded border border-gray-300 shadow-sm">
      <div className="mb-2 flex justify-between items-end">
        <label className="text-sm font-bold text-[#003366] uppercase">
          SPARQL Query Editor
        </label>
        {/* Ένδειξη status */}
        {errorMessage ? (
           <span className="text-xs font-bold text-red-600 animate-pulse">● Compilation Failed</span>
        ) : (
           <span className="text-xs font-bold text-green-600">● Ready</span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className={`w-full h-80 p-3 font-mono text-sm bg-white border rounded-sm outline-none text-gray-800 shadow-inner
            ${errorMessage ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-400 focus:border-[#003366] focus:ring-1 focus:ring-[#003366]'}
          `}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck="false"
          placeholder="Write your SPARQL query here..."
        />
        
        {/* --- COMPILER ERROR MESSAGE BOX --- */}
        {errorMessage && (
          <div className="bg-[#fff5f5] border-l-4 border-red-600 p-3 rounded-sm shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center gap-2 mb-1">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-600">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
               </svg>
               <span className="text-xs font-bold text-red-700 uppercase">Syntax Error / Server Message</span>
            </div>
            <pre className="text-xs text-red-800 font-mono whitespace-pre-wrap break-all ml-6">
              {errorMessage}
            </pre>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
           <div className="text-sm text-gray-600 hidden sm:block">
             Press <strong>Run Query</strong> to execute.
           </div>

           <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setQuery("")}
              className="px-4 py-1.5 text-sm bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-sm border border-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 text-sm bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-sm shadow-sm transition-colors flex items-center gap-2"
            >
              <span>▶</span> Run Query
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QueryEditor;