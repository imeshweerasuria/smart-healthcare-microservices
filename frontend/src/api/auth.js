export function saveSession({ token, role, email }) {
 localStorage.setItem("token", token);
 localStorage.setItem("role", role);
 if (email) localStorage.setItem("email", email);
}

export function clearSession() {
 localStorage.removeItem("token");
 localStorage.removeItem("role");
 localStorage.removeItem("email");
}

export function getRole() {
 return localStorage.getItem("role");
}

export function isLoggedIn() {
 return !!localStorage.getItem("token");
}
