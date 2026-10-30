import axios from "axios";

const baseUrl = '/api'

const api = axios.create({
    // baseURL de la API de .NET
    baseURL: baseUrl
});

api.interceptors.response.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;