import axios from "axios";

const DEV_BACKEND = import.meta.env.DEV ? "http://localhost:5002" : "";

export const axiosInstance = axios.create({
    baseURL: `${DEV_BACKEND}/api`,
    withCredentials: true,
});
