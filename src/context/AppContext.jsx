import { createContext, useEffect, useState, useRef } from "react";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export default function AppProvider({ children }) {

 
    //Dark or Light mode
    const [darkMode, setDarkMode] = useState(false);

    //
    const [responsables, setResponsables] = useState([]);


    //
    const [centros, setCentros] = useState([]);

    //
    const [proyectos, setProyectos] = useState([]);

    const [servicios, setServicios] = useState([]);

    const [mostrarCerrados, setMostrarCerrados] = useState(false);

    //
    const [usuarios, setUsuarios] = useState([]);

    //
    const [types, setTypes] = useState([]);

    //
    const [customers, setCustomers] = useState([]);
    

    // Cotizaciones pendientes
    const [pendientes, setPendientes] = useState([]);

    const [pendientesEnvio, setPendientesEnvio] = useState([]);

    const [units, setUnits] = useState([]);


    let tableRef = useRef(null);


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
    const [requestHeader, setRequestHeader] = useState({headers: {Authorization: `Bearer ${token}`,},});

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

    async function fetchUsuarios() {
        try {
            const res = await clienteAxios.get("/api/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUsuarios(res.data);
        } catch (error) {
            setUsuarios([]);
            toast.error("Error al cargar los usuarios");
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

        async function fetchResponsables() {
        try {
            const res = await clienteAxios.get("/api/responsibles", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setResponsables(res.data);
        } catch (error) {
            setResponsables([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los responsables");
        }
    }

    async function fetchCustomers() {
        try {
            const res = await clienteAxios.get("/api/customers", requestHeader);
            setCustomers(res.data);

        } catch (error) {
            console.log(error);
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

    async function fetchPendientes() {
        try {
            const res = await clienteAxios.get("/api/invoices/pending", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPendientes(res.data);
        } catch (error) {
            setPendientes([]);
            toast.error("Error al cargar las cotizaciones pendientes");
        }
    }

    async function fetchPendientesEnvio() {
        try {
            const res = await clienteAxios.get("/api/invoices/email-pending", requestHeader);
            setPendientesEnvio(res.data);

        } catch (error) {
            console.log([]);
        }
    }

    const fetchTypes = async () => {
        try {
            const res = await clienteAxios.get(`/api/vehicles-types`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTypes(res.data);
        } catch (error) {
            toast.error("Error al cargar los tipos de vehículos");
        }
    };

    // Catálogo de unidadesd de medida del SAT
    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/invoices/units`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnits(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el servicio");
        } finally {
            setLoading(false);
        }
    };

    //Menú de navegación
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Loading
    const [loading, setLoading] = useState(false);

    //Total de filas


    return (
        <AppContext.Provider
            value={{
                token,
                requestHeader,
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
                tableRef,
                mostrarCerrados,
                setMostrarCerrados,

                pendientes,
                fetchPendientes,
                pendientesEnvio,
                fetchPendientesEnvio,

                usuarios,
                fetchUsuarios,

                fetchResponsables,
                responsables,

                types,
                fetchTypes,

                customers,
                fetchCustomers,

                //SAT
                fetchUnits, 
                units,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
