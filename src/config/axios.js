import axios from "axios";

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        // Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true,
})


// Interceptor de RESPONSE — captura el 401 y redirige a /login
clienteAxios.interceptors.response.use(
    (response) => response, // si va bien, déjalo pasar
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // 1. Limpiar sesión
            localStorage.removeItem("NEON_GONZ_TOKEN");

            // 2. Redirigir a login (funciona fuera de React sin useNavigate)
            window.location.href = "/login";
        }

        // Rechaza el error igual para que tus catch locales sigan funcionando
        return Promise.reject(error);
    }
);

export default clienteAxios;
