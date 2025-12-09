import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add token to every request if it exists
api.interceptors.request.use(
    (config) => {
        // Check both localStorage (remember me) and sessionStorage (no remember me)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 errors globally - clear storage and redirect to login
// But only redirect if not already handling it in component
let redirecting = false;
let redirectTimeout = null;
let redirectHandledByComponent = false;

// Allow components to mark that they're handling the redirect
export const setRedirectHandledByComponent = (handled) => {
    redirectHandledByComponent = handled;
};

api.interceptors.response.use(
    (response) => {
        // Reset flag on successful response
        redirectHandledByComponent = false;
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear all authentication data FIRST to prevent Landing page from redirecting back
            localStorage.removeItem('token');
            localStorage.removeItem('student');
            localStorage.removeItem('user_type');
            localStorage.removeItem('rememberMe');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('student');
            sessionStorage.removeItem('user_type');
            
            // Only redirect if component hasn't already handled it
            // Also check if we're on a protected route (dashboard pages)
            const currentPath = window.location.pathname;
            const isProtectedRoute = currentPath.includes('/dashboard') || 
                                     currentPath.includes('/personnel') || 
                                     currentPath.includes('/admin') || 
                                     currentPath.includes('/student');
            
            // Don't redirect if component is handling it, or if we're already redirecting
            if (!redirectHandledByComponent && !redirecting && isProtectedRoute && currentPath !== '/' && !currentPath.includes('/login')) {
                redirecting = true;
                // Clear any existing timeout
                if (redirectTimeout) {
                    clearTimeout(redirectTimeout);
                }
                // Use a longer delay to allow the component to handle it first
                redirectTimeout = setTimeout(() => {
                    if (redirecting && window.location.pathname !== '/' && !redirectHandledByComponent) {
                        // Use replace to prevent back button issues
                        window.location.replace('/');
                    }
                    redirecting = false;
                }, 2000);
            }
        }
        return Promise.reject(error);
    }
);

export default api;