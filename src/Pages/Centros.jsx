import { useContext, useEffect, useState } from "react";
// import "../../node_modules/react-tabulator/css/materialize/tabulator_materialize.min.css";
import { ReactTabulator } from "react-tabulator";
import clienteAxios from "../config/axios";
import { AppContext } from "../context/AppContext";
import Modal from "../components/Modal";
import { toast } from "react-toastify";

export default function Centros() {
    const [centros, setCentros] = useState([]);
    const {token, setLoading} = useContext(AppContext);

    const [isModalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        responsible: "",
        location: "",
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.post("/api/centres",
                formData,
                {headers: {
                    Authorization: `Bearer ${token}`,
                }},
            );

            fetchCentros();
            setModalOpen(false);
            toast.success("Centro de venta cargado correctamente");
            setFormData({
                name: "",
                responsible: "",
                location: "",
            });
            setErrors({});

        } catch (error) {
            console.error("Error during login:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
        finally {
            setLoading(false);
        }
    }

    async function fetchCentros ()  {
        try {
            const res = await clienteAxios.get("/api/centres", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCentros(res.data)

        } catch (error) {
            setCentros([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los centros de venta");
        }
    }

    // Consultar todas las agencias  al cargar el componente
    useEffect(() => {
        setLoading(true);
        fetchCentros();
        setLoading(false);
    }, []);

    const columns = [
        { title: "Nombre", field: "name", headerFilter: "input" },
        { title: "Responsable", field: "responsible", headerFilter: "input" },
        { title: "Ubicación", field: "location", headerFilter: "input", width: 400 },
    ];
    
    return (
        <>
            <h2 className="title-2">Centros de venta</h2>
            <button
                className="btn"
                onClick={() => {
                    setModalOpen(true);
                }}
            >
                Nuevo
            </button>
            <div>
                <ReactTabulator
                    data={centros}
                    columns={columns}
                    // layout={"fitColumns"}
                    options={{
                        layout: "fitData",
                    }}

                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="title-3">Nuevo centro de ventas</h2>

                <form action="">
                    <label className="label" htmlFor="nombre">
                        Nombre
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="nombre"
                        placeholder="Nombre del centro"
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    {errors.name && (
                        <p className="text-red-500">{errors.name[0]}</p>
                    )}

                    <label className="label" htmlFor="responsible">
                        Responsable del centro
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="responsible"
                        placeholder="Responsable del centro"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                responsible: e.target.value,
                            })
                        }
                    />
                    {errors.responsible && (
                        <p className="text-red-500">
                            {errors.responsible[0]}
                        </p>
                    )}

                    <label className="label" htmlFor="location">
                        Unicación
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="location"
                        placeholder="Ubicación o dirección del centro"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value,
                            })
                        }
                    />
                    {errors.location && (
                        <p className="text-red-500">
                            {errors.location[0]}
                        </p>
                    )}

                    <input
                        className="btn"
                        type="submit"
                        value="Guardar"
                        onClick={handleSubmit}
                    />
                </form>
            </Modal>
        </>
    );
}
