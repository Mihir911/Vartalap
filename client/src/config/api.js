import axios from "axios";


const API = axios.create({
    baseURL: `${import.meta.env.API_URL}`
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
