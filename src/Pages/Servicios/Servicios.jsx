import { useCallback, useContext, useEffect, useState } from "react";
import Tabla from "../../components/Tabla";
import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CirclePlus } from "lucide-react";
import ErrorLabel from "@/components/UI/ErrorLabel";

export default function Servicios() {
    const [servicios, setServicios] = useState([]);
    const navigate = useNavigate();

    const { token, setLoading, totalFilas, setTotalFilas } = useContext(AppContext);

    const [isModalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        multiple_quantity: false,
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await clienteAxios.post("/api/services", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchServicios();
            setModalOpen(false);
            toast.success("Servicio creado correctamente");
            setFormData({name: ""});
            setErrors({});
        } catch (error) {
            console.error("Error during login:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

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

    const handleRowClick = useCallback((e, row) => {
        const id = row.getData().id;
        navigate(`/servicios/${id}`);
    }, []);

    // Consultar todas las agencias  al cargar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchServicios();
            setLoading(false);
        };

        fetchData();
    }, []);

    const columns = [
        { field: "id", visible: false},
        { title: "Nombre", field: "name", headerFilter: "input" },
    ];

    return (
        <>
            <h2 className="title-2">Catálogo de servicios</h2>
            
            <div className="contenedor-botones">
                <button
                    className="btn"
                    onClick={() => {
                        setModalOpen(true);
                    }}
                >
                    <CirclePlus />
                    Nuevo
                </button>
            </div>

            <Tabla
                options={{
                    pagination: "local",
                    paginationSize: 20,
                }}
                onRowClick={handleRowClick}
                columns={columns}
                data={servicios}
                title="Catálogo de servicios"
            />

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="title-3">Nuevo servicio</h2>

                <form action="">
                    <label className="label" htmlFor="nombre">
                        Nombre
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="nombre"
                        placeholder="Nombre o descripción"
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    <ErrorLabel>{errors.name}</ErrorLabel>

                    <label className="label">
                        Piezas múltiples (Ej. rieles, rotulación de x lados, etc.)
                    </label>
                
                    <select 
                        name="multiple_quantity" 
                        id="mutiple_quantity"
                        onChange={(e) => setFormData({ ...formData, multiple_quantity: e.target.value === "true" })}
                    >
                        <option value="false" selected={formData.multiple_quantity === false}>No</option>
                        <option value="true" selected={formData.multiple_quantity === true}>Sí</option>
                    </select>
                    <ErrorLabel>{errors.multiple_quantity}</ErrorLabel>

                        
                    
                    <div className="contenedor-botones">
                        <input
                            className="btn"
                            type="submit"
                            value="Guardar"
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
}
