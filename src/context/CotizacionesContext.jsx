// CotizacionesContext.jsx
import { createContext, useState } from "react";
import { useSelection } from "@/hooks/useSelection";

export const CotizacionesContext = createContext();

export default function CotizacionesProvider({ children }) {

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
            ...selection  // expande todas las propiedades del hook
        }}>
            {children}
        </CotizacionesContext.Provider>
    );
}