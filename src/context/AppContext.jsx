import { createContext, useEffect, useState } from "react";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export default function AppProvider({ children }) {

 
    //Dark or Light mode
    const [darkMode, setDarkMode] = useState(false);

    //
    const [centros, setCentros] = useState([]);

    //
    const [proyectos, setProyectos] = useState([]);

    const [servicios, setServicios] = useState([]);


    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem("darkMode", newDarkMode);

        document.documentElement.classList.toggle("dark", newDarkMode);
    };

    useEffect(() => {
        const storedDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(storedDarkMode);

        if (storedDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Token de authentication
    const [token, setToken] = useState(localStorage.getItem("NEON_GONZ_TOKEN") || null);
    const [user, setUser] = useState(null);

    async function getUser() {
        try {
            setLoading(true);
            const res = await clienteAxios.get("/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(res.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) getUser();
    }, [token]);


    async function handleLogout(e) {
        e.preventDefault();

        setLoading(true);

        try {
            await clienteAxios.post("/api/logout", null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            localStorage.removeItem("NEON_GONZ_TOKEN");
            setToken(null);
            setUser(null);
            window.location.href = "/"; 
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    async function fetchCentros() {
        try {
            const res = await clienteAxios.get("/api/centres", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCentros(res.data);
        } catch (error) {
            setCentros([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los centros");
        }
    }

    async function fetchServicios() {
        try {
            const res = await clienteAxios.get("/api/services", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setServicios(res.data);
        } catch (error) {
            setServicios([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los servicios");
        }
    }

    //Menú de navegación
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Loading
    const [loading, setLoading] = useState(false);

    //Total de filas


    return (
        <AppContext.Provider
            value={{
                token,
                setToken,
                user,
                setUser,
                darkMode,
                toggleDarkMode,
                handleLogout,
                isMenuOpen,
                setIsMenuOpen,
                loading,
                setLoading,
                fetchCentros,
                centros,
                setCentros,
                proyectos,
                setProyectos,
                fetchServicios,
                servicios,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
