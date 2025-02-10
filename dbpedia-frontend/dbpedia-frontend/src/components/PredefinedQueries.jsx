import { useEffect, useState } from "react";
import { fetchPredefinedQueries, executeSPARQLQuery } from "../api/api";

const PredefinedQueries = ({ onResults }) => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        const data = await fetchPredefinedQueries();
        setQueries(data);
      } catch (error) {
        console.error("Failed to fetch predefined queries:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const handleRunQuery = async (query) => {
    setLoading(true);
    try {
      const results = await executeSPARQLQuery(query);
      onResults(results);
    } catch (error) {
      onResults({ error: "Query failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Predefined Queries</h2>
      {loading ? (
        <p>Loading queries...</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {queries.map((query, index) => (
            <li key={index}>
              <button
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => handleRunQuery(query)}
              >
                {query}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PredefinedQueries;