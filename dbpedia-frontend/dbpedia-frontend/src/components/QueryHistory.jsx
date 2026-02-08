import React, { useEffect, useState } from "react";

const QueryHistory = ({ onSelectQuery }) => {
  const [history, setHistory] = useState([]);

  // Φόρτωση ιστορικού κατά την εκκίνηση και όταν αλλάζει το localStorage
  useEffect(() => {
    const loadHistory = () => {
      const storedHistory = localStorage.getItem("queryHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    };

    loadHistory();

    // Ακούμε για αλλαγές (αν το ιστορικό ενημερωθεί από άλλο tab ή component)
    window.addEventListener("storage", loadHistory);
    // Επειδή το localStorage δεν ενημερώνει το ίδιο το tab, 
    // το App.jsx θα κάνει re-render τον component όταν αλλάζει το state του history.
    
    // Εναλλακτικά, απλά διαβάζουμε το prop αν το περνάγαμε, 
    // αλλά εδώ διαβάζουμε απευθείας το localStorage κάθε δευτερόλεπτο για απλότητα
    const interval = setInterval(loadHistory, 1000);

    return () => {
      window.removeEventListener("storage", loadHistory);
      clearInterval(interval);
    };
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic text-center py-4">
        No history yet. Run a query!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
      {history.map((q, index) => (
        <div
          key={index}
          onClick={() => onSelectQuery(q)}
          className="cursor-pointer bg-gray-50 hover:bg-blue-50 border-l-4 border-gray-300 hover:border-[#003366] p-3 rounded-r-md transition-colors duration-200 group"
        >
          <div className="text-xs font-mono text-gray-600 group-hover:text-blue-900 line-clamp-3 break-all">
            {q}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 text-right font-semibold uppercase tracking-wider group-hover:text-blue-400">
            Restore
          </div>
        </div>
      ))}
    </div>
  );
};

export default QueryHistory;