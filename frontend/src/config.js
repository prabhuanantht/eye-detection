let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
if (API_BASE_URL !== '/api' && !API_BASE_URL.startsWith('http')) {
    API_BASE_URL = `https://${API_BASE_URL}`;
}

export default API_BASE_URL;
