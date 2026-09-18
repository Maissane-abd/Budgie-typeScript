import axios from "axios";

import { API_BASE } from "@/config/api";

const API_URL = `${API_BASE}/accounts`;

export const AccountsService = {
    getAll() {
        const token = localStorage.getItem("budgie_token");

        return axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    create(payload) {
        const token = localStorage.getItem("budgie_token");

        return axios.post(API_URL, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    update(id, payload) {
        const token = localStorage.getItem("budgie_token");

        return axios.put(`${API_URL}/${id}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },


    delete(id) {
        const token = localStorage.getItem("budgie_token");

        return axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

};
