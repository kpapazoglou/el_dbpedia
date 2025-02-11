import { useState, useEffect } from "react";

const QueryHistory = ({ onSelectQuery }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("queryHistory")) || [];
    setHistory(savedHistory);
  }, []);

  const handleSelect = (query) => {
    onSelectQuery(query);
  };

  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Query History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No recent queries.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {history.map((query, index) => (
            <li key={index} className="p-2 border rounded cursor-pointer hover:bg-gray-100" onClick={() => handleSelect(query)}>
              {query.length > 50 ? query.substring(0, 50) + "..." : query}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QueryHistory;