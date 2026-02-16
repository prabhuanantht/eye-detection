import axios from 'axios';

// In dev, you can point directly to your backend server.
// By default, we'll assume Flask is running at http://localhost:5000.
// Override this by setting VITE_API_URL in a .env file if needed.
const devBaseURL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';

// In production (Vercel), keep requests relative so they hit /api/* on the same domain.
const baseURL = import.meta.env.DEV ? devBaseURL : '';

export const apiClient = axios.create({
    baseURL,
});

