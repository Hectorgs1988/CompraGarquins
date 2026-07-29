function resolveApiBaseUrl() {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:4100`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
        const message = payload?.error || "Request failed";
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    return payload;
}
