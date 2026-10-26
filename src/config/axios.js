import axios from "axios";

const api = axios.create({
    // baseURL de la API de .NET
    baseURL: "/api"
});

api.interceptors.response.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;