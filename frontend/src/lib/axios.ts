import axios from "axios";
import { env } from "../config/env";

export const api = axios.create({
    baseURL: env.apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});