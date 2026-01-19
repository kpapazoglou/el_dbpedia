import React, { useState } from 'react';

// Component για κείμενο που ανοιγοκλείνει
const TextCell = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const limit = 80; // Μικρότερο όριο για πιο compact πίνακα

  if (!text) return null;
  if (text.length <= limit) return <span>{text}</span>;

  return (
    <div>
      <span>{expanded ? text : `${text.substring(0, limit)}...`}</span>
      <button
        onClick={() => setExpanded(!expanded)}
        className="ml-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wide"
      >
        {expanded ? "Less" : "More"}
      </button>
    </div>
  );
};

// Component για το κελί του Χάρτη (Pin Icon)
const MapCell = ({ url }) => {
  if (!url) return <span className="text-gray-300">-</span>;
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm border border-blue-100"
      title="View on Google Maps"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    </a>
  );
};

// Component για το κελί της Εικόνας
const ImageCell = ({ url }) => {
  if (!url) return <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-300 text-xs">No Img</div>;
  
  return (
    <div className="relative group w-16 h-12">
      <img 
        src={url} 
        alt="thumb" 
        className="w-full h-full object-cover rounded-md shadow-sm border border-gray-200 transition-transform duration-300 group-hover:scale-150 group-hover:z-10 relative bg-white"
        onError={(e) => { e.target.style.display = 'none'; }} 
      />
    </div>
  );
};

const ResultsTable = ({ results }) => {
  if (!results || !results.head || !results.results) return null;

  const variables = results.head.vars;
  const bindings = results.results.bindings;

  if (bindings.length === 0) {
    return (
      <div className="p-8 text-center bg-blue-50 text-[#003366] rounded border border-blue-100">
        <span className="font-semibold">No results found.</span> Try a different query.
      </div>
    );
  }

  const isUrl = (str) => typeof str === 'string' && (str.startsWith('http://') || str.startsWith('https://'));

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto w-full max-h-[600px] border border-gray-300 rounded-sm shadow-sm custom-scrollbar bg-white">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead className="bg-[#003366] text-white sticky top-0 z-20 shadow-md">
            <tr>
              <th className="px-4 py-3 font-semibold uppercase tracking-wider text-xs border-r border-blue-800 w-12 text-center">#</th>
              {variables.map((v) => (
                <th key={v} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs border-r border-blue-800 whitespace-nowrap">
                  {v === 'image' ? 'IMG' : v === 'map' ? 'MAP' : v}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {bindings.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`transition-colors duration-150 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#f8fbff]'} hover:bg-blue-50`}
              >
                <td className="px-2 py-2 text-gray-500 font-mono text-xs border-r border-gray-200 text-center align-middle">
                  {rowIndex + 1}
                </td>
                {variables.map((v) => {
                  const cellData = row[v];
                  const value = cellData ? cellData.value : null;

                  // --- ΕΙΔΙΚΑ ΚΕΛΙΑ (Custom Renders) ---
                  if (v === 'image') {
                     return <td key={v} className="px-2 py-1 border-r border-gray-200 align-middle text-center"><ImageCell url={value} /></td>;
                  }
                  if (v === 'map') {
                     return <td key={v} className="px-2 py-1 border-r border-gray-200 align-middle text-center"><MapCell url={value} /></td>;
                  }
                  if (v === 'info') {
                     return <td key={v} className="px-4 py-2 border-r border-gray-200 align-top min-w-[250px]"><TextCell text={value} /></td>;
                  }
                  // -------------------------------------

                  if (!value) return <td key={v} className="px-4 py-2 border-r border-gray-200"></td>;

                  const isLink = cellData.type === 'uri' || isUrl(value);

                  return (
                    <td key={v} className="px-4 py-2 border-r border-gray-200 align-middle whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                      {isLink ? (
                        <a 
                          href={value} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0056b3] hover:text-[#003366] hover:underline font-medium"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-800">
                          {value}
                          {cellData['xml:lang'] && (
                            <span className="ml-1 text-[9px] text-gray-400 bg-gray-100 px-1 rounded">
                              {cellData['xml:lang']}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 border-t border-gray-300 p-2 text-right text-xs text-gray-600 font-medium">
        Total Results: {bindings.length}
      </div>
    </div>
  );
};

export default ResultsTable;