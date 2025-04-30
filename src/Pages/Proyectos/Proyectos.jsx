import { useContext, useEffect, useState } from "react";
// import "../../node_modules/react-tabulator/css/materialize/tabulator_materialize.min.css";
import { ReactTabulator } from "react-tabulator";
import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

export default function Proyectos() {
    const [projects, setProjects] = useState([]);
    const [centros, setCentros] = useState([]);
    const [catalogoServicios, setCatalogoServicios] = useState([]);

    const { token, setLoading } = useContext(AppContext);

    const [isModalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        centre_id: "",
        service_id: "",
        date: new Date().toISOString().split("T")[0],
    });

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.post("/api/projects", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchProyectos();
            setModalOpen(false);
            toast.success("Servicio creado correctamente");
            setFormData({
                centre_id: "",
                service_id: "",
                date: "",
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
    };

    async function fetchProyectos(page = 1) {
        try {
            const res = await clienteAxios.get(`/api/projects?page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProjects(res.data);
        } catch (error) {
            setProjects([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los servicios");
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

    async function fetchCatalogoServicios() {
        try {
            const res = await clienteAxios.get("/api/services", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCatalogoServicios(res.data);
        } catch (error) {
            setCatalogoServicios([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los servicios");
        }
    }

    const handleRowClick = (e, row) => {
        const id = row.getData().id;
        navigate(`/proyectos/${id}`);
    };

    useEffect(() => {
        setLoading(true);
        fetchProyectos();
        fetchCentros();
        fetchCatalogoServicios();        
        setLoading(false);
    }, []);

    const columns = [
        {
            title: "Nombre",
            field: "service.name",
            headerFilter: "input",
            width: 250,
        },
        {
            title: "Centro de ventas",
            field: "centre.name",
            headerFilter: "input",
            width: 250,
        },
        {
            title: "Fecha",
            field: "date",
            headerFilter: "input",
            // formatter: "datetime",
        },
    ];

    return (
        <>
            <h2 className="title-2">Listado de proyectos</h2>
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
                    data={projects}
                    columns={columns}
                    // layout={"fitColumns"}
                    options={{
                        pagination: "local",
                        paginationSize: 20,
                        resizableColumnFit: false,
                        layout: "fitDataStretch",

                        langs: {
                            default: {
                                pagination: {
                                    first: "Primero",
                                    first_title: "Primera página",
                                    last: "Último",
                                    last_title: "Última página",
                                    prev: "Anterior",
                                    prev_title: "Página anterior",
                                    next: "Siguiente",
                                    next_title: "Página siguiente",
                                },
                            },
                        },
                    }}
                    events={{
                        rowClick: handleRowClick,
                    }}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="title-3">Nuevo proyecto</h2>

                <form action="">
                    <label className="label" htmlFor="centre_id">
                        Centro de ventas
                    </label>
                    <select
                        id="centre_id"
                        className="input"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                centre_id: e.target.value,
                            })
                        }
                    >
                        <option value="" selected disabled>
                            Seleccione un centro de ventas
                        </option>
                        {centros.map((centro) => (
                            <option key={centro.id} value={centro.id}>
                                {centro.name}
                            </option>
                        ))}
                    </select>
                    {errors.centre_id && (
                        <p className="text-red-500">{errors.centre_id[0]}</p>
                    )}

                    <label className="label" htmlFor="service_id">
                        Servicio
                    </label>
                    <select
                        id="service_id"
                        className="input"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                service_id: e.target.value,
                            })
                        }
                    >
                        <option selected disabled>
                            Seleccione un servicio
                        </option>
                        {catalogoServicios.map((centro) => (
                            <option key={centro.id} value={centro.id}>
                                {centro.name}
                            </option>
                        ))}
                    </select>
                    {errors.service_id && (
                        <p className="text-red-500">{errors.service_id[0]}</p>
                    )}

                    <label className="label" htmlFor="fecha">
                        fecha
                    </label>
                    <input
                        className="input"
                        type="date"
                        id="fecha"
                        placeholder="fecha"
                        value={formData.date}
                        // defaultValue={formData.date || new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                date: e.target.value,
                            })
                        }
                    />
                    {errors.date && (
                        <p className="text-red-500">{errors.date[0]}</p>
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
