import { useContext, useEffect, useState } from "react";
// import "../../node_modules/react-tabulator/css/materialize/tabulator_materialize.min.css";
import { ReactTabulator } from "react-tabulator";
import clienteAxios from "../config/axios";
import { AppContext } from "../context/AppContext";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import { CirclePlus } from "lucide-react";

export default function Centros() {
    const [centros, setCentros] = useState([]);
    const [centro, setCentro] = useState({});
    const { token, setLoading, totalFilas, setTotalFilas } = useContext(AppContext);

    const [isModalCreateOpen, setModalCreateOpen] = useState(false);
    const [isModalViewOpen, setModalViewOpen] = useState(false);


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
            setModalCreateOpen(false);
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
        const fetchData = async () => {
            setLoading(true);
            await fetchCentros();
            setLoading(false);
        };

        fetchData();
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
                className="btn mb-4"
                onClick={() => {
                    setModalCreateOpen(true);
                }}
            >
                <CirclePlus />
                Nuevo
            </button>

            <p className="text">
                Total: <span className="font-bold">{totalFilas}</span>
            </p>

            <div>
                <ReactTabulator
                    data={centros}
                    columns={columns}
                    // layout={"fitColumns"}
                    options={{
                        layout: "fitData",
                    }}
                    events={{
                        rowClick: (e, row) => {
                            setModalViewOpen(true);
                            const data = row.getData();
                            setCentro(data);
                        },
                        dataLoaded: (data) => setTotalFilas(data.length),
                        dataFiltered: (filters, rows) => setTotalFilas(rows.length),
                    }}
                />
            </div>

            <Modal
                isOpen={isModalCreateOpen}
                onClose={() => setModalCreateOpen(false)}
            >
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
                        <p className="text-red-500">{errors.responsible[0]}</p>
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
                        <p className="text-red-500">{errors.location[0]}</p>
                    )}

                    <input
                        className="btn"
                        type="submit"
                        value="Guardar"
                        onClick={handleSubmit}
                    />
                </form>
            </Modal>

            <Modal
                isOpen={isModalViewOpen}
                onClose={() => setModalViewOpen(false)}
            >
                <h2 className="title-3">Centro de ventas</h2>
                <div className="flex flex-col gap-3 pl-2">
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Nombre
                        </span>{" "}
                        <p>{centro?.name}</p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Responsable
                        </span>{" "}
                        <p>{centro?.responsible}</p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Ubicación
                        </span>{" "}
                        <p>{centro?.location}</p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
