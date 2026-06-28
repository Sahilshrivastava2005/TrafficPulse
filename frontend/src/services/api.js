import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export const fetchAnalyticsData = async (filters = {}) => {
  try {
    const response = await axios.post(`${API_BASE}/analytics-data`, filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};

export const fetchMetadata = async () => {
  try {
    const response = await axios.get(`${API_BASE}/metadata`);
    return response.data;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    throw error;
  }
};

export const runPrediction = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE}/predict`, payload);
    return response.data;
  } catch (error) {
    console.error("Error running prediction:", error);
    throw error;
  }
};
