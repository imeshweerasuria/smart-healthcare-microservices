import axios from "axios";

export const API = {
 auth: "http://localhost:4001",
 patient: "http://localhost:4002",
 doctor: "http://localhost:4003",
 appointment: "http://localhost:4004",
 telemedicine: "http://localhost:4005",
 notification: "http://localhost:4006",
 payment: "http://localhost:4007",
};

export function getToken() {
 return localStorage.getItem("token");
}

export function authHeaders() {
 const token = getToken();
 return token ? { Authorization: `Bearer ${token}` } : {};
}

export const http = axios.create();
