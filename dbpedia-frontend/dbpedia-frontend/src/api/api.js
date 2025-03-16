import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL||"http://localhost:8080";

const handleRequest = async (method, url, data = null) => {
  try {
    const response = await axios({ method, url: `${API_BASE_URL}${url}`, data });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error.message;
  }
};

export const executeSPARQLQuery = (query) => handleRequest("POST", "/api/query", { query });

export const fetchPredefinedQueries = () => handleRequest("GET", "/api/predefined?query=all_classes");