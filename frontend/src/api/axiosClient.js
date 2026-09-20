import axios from 'axios';

const backendUrl = import.meta.env?.VITE_BACKEND_URL || '';

const axiosClient = axios.create({
	// Ensure the baseURL always has a trailing slash for Django/DRF compatibility
	baseURL: backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`,
	withCredentials: true,
	withXSRFToken: true,
	xsrfCookieName: 'csrftoken',
	xsrfHeaderName: 'X-CSRFToken',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request Interceptor: Attach Knox Token if available
axiosClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			const cleanToken = token.replace(/['"]+/g, '');
			config.headers.Authorization = `Token ${cleanToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response Interceptor: Global Error Handling
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			// Clear token and redirect to login on unauthorized access
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
			}
		}
		if (error.code === 'ECONNABORTED') {
			console.error('Request timed out. Please check your connection.');
		}
		return Promise.reject(error);
	},
);

export default axiosClient;
