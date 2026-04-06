// CotizacionesContext.jsx
import { createContext, useState, useContext } from "react";
import { useSelection } from "@/hooks/useSelection";
import clienteAxios from "@/config/axios";
import { AppContext } from "@/context/AppContext";


export const CotizacionesContext = createContext();

export default function CotizacionesProvider({ children }) {

    const { token, setLoading } = useContext(AppContext);


    const [cotizacion, setCotizacion] = useState(null);
    const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
    const [centro, setCentro] = useState("");
    const [formData, setFormData] = useState({
        vehicles: [],
        responsible_id: null,
        comments: null
    });

    // ← los que moviste de Nueva.jsx
    const [centrosPendientes, setCentrosPendientes] = useState([]);
    const [proyectosPendientes, setProyectosPendientes] = useState([]);
    const [seleccionarTodo, setSeleccionarTodo] = useState(false);
    const [proyectosSeleccionados, setProyectosSeleccionados] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const selection = useSelection(); // { selected, toggle, clear, ... }

    const fetchCotizacion = async (id) => {
        try {
            setLoading(true);
            const res = await clienteAxios.get(`/api/invoices/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,   
                },  
            });

            setCotizacion(res.data);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <CotizacionesContext.Provider value={{
            vehiculosPendientes, setVehiculosPendientes,
            centro, setCentro,
            formData, setFormData,
            centrosPendientes, setCentrosPendientes,
            proyectosPendientes, setProyectosPendientes,
            seleccionarTodo, setSeleccionarTodo,
            proyectosSeleccionados, setProyectosSeleccionados,
            subTotal, setSubTotal,
            ...selection,  // expande todas las propiedades del hook

            cotizacion, fetchCotizacion, setCotizacion
        }}>
            {children}
        </CotizacionesContext.Provider>
    );
}