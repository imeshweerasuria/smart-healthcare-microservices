import axios from "axios";
import { API } from "./client";

export function saveSession({ token, role, email, name, userId }) {
 localStorage.setItem("token", token);
 localStorage.setItem("role", role);
 if (email) localStorage.setItem("email", email);
 if (name) localStorage.setItem("name", name);
 if (userId) localStorage.setItem("userId", userId);
}

export function clearSession() {
 localStorage.removeItem("token");
 localStorage.removeItem("role");
 localStorage.removeItem("email");
 localStorage.removeItem("name");
 localStorage.removeItem("userId");
}

export function getRole() {
 return localStorage.getItem("role");
}

export function getEmail() {
 return localStorage.getItem("email");
}

export function getName() {
 return localStorage.getItem("name");
}

export function isLoggedIn() {
 return !!localStorage.getItem("token");
}

export async function login(payload) {
 const res = await axios.post(`${API.auth}/auth/login`, payload);
 return res.data;
}

export async function register(payload) {
 const res = await axios.post(`${API.auth}/auth/register`, payload);
 return res.data;
}

export async function getMe(token) {
 const res = await axios.get(`${API.auth}/auth/me`, {
   headers: { Authorization: `Bearer ${token}` },
 });
 return res.data;
}
