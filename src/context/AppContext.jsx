import { createContext, useEffect, useState } from "react";
import clienteAxios from "../config/axios";


export const AppContext = createContext();

export default function AppProvider({ children }) {

 
    //Dark or Light mode
    const [darkMode, setDarkMode] = useState(false);

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

    //Menú de navegación
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Loading
    const [loading, setLoading] = useState(false);

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
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
