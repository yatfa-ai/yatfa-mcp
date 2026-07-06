import axios from 'axios';

const API_BASE_URL = process.env.YATFA_API_URL || 'http://localhost:3000/api/v1';
const API_KEY = process.env.YATFA_API_KEY;

if (!API_KEY) {
    console.error("Warning: YATFA_API_KEY not found in environment variables.");
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Accept': 'application/json'
    }
});
