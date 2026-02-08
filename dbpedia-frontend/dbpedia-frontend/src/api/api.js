import axios from "axios";

const API_BASE_URL = 'http://localhost:8080';

const handleRequest = async (method, url, data = null) => {
  try {
    const response = await axios({ 
      method, 
      url: `${API_BASE_URL}${url}`, 
      data 
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);

    
    let errorMessage = "Unknown error occurred.";

    if (error.response && error.response.data) {
      // Αν ο server έστειλε απάντηση (π.χ. Syntax Error από το Virtuoso)
      const serverData = error.response.data;
      
      // Αν είναι αντικείμενο, το κάνουμε string, αλλιώς το παίρνουμε ως έχει
      errorMessage = typeof serverData === 'object' 
        ? (serverData.message || JSON.stringify(serverData)) 
        : serverData;
        
    } else if (error.message) {
      // Αν είναι θέμα δικτύου (π.χ. Network Error)
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const executeSPARQLQuery = (query) => handleRequest("POST", "/sparql", { query });

export const fetchPredefinedQueries = () => handleRequest("GET", "/predefined?query=all_classes");