import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API = axios.create({
    baseURL: process.env.API_URL,
});

API.interceptors.request.use((config) => {
    const stored = localStorage.getItem("vartalap-user");
    if (stored) {
        const user = JSON.parse(stored);
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    }
    return config;
});

export default API;
