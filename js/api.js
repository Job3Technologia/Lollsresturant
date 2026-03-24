const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    get: async (endpoint) => {
        const response = await secureFetch(`${API_BASE_URL}${endpoint}`);
        return await response.json();
    },
    post: async (endpoint, data) => {
        const response = await secureFetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    put: async (endpoint, data) => {
        const response = await secureFetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    delete: async (endpoint) => {
        const response = await secureFetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
};
