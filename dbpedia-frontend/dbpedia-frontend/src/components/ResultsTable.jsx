const ResultsTable = ({ results }) => {
  if (!results || Object.keys(results).length === 0) return null;

  if (results.error) return <p className="text-red-500">{results.error}</p>;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Query Results</h2>
      <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
};

export default ResultsTable;