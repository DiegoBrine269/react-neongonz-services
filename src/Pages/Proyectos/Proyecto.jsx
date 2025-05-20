import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import Modal from "../../components/Modal";
import Swal from "sweetalert2";
import Tabla from "../../components/Tabla";
import { swalConfig } from "../../config/variables";
import { ClipboardCopy, Trash2, ClipboardCheck, Car, CircleCheck, ChevronDown, ChevronRight, Pencil,Save } from "lucide-react";
import ErrorBoundary from '../../components/ErrorBoundary';
import { format } from "@formkit/tempo";


export default function Proyecto() {
    const navigate = useNavigate();

    const { id } = useParams();
    const [editando, setEditando] = useState(false);
    const [proyectosAbiertos, setProyectosAbiertos] = useState([]);
    const [proyecto, setProyecto] = useState({});
    const [vehiculos, setVehiculos] = useState([]);
    const [types, setTypes] = useState([]);
    const [isModalAgregarOpen, setModalAgregarOpen] = useState(false);
    const [isModalConsultarOpen, setModalConsultarOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [vehiculo, setVehiculo] = useState({
        eco: "",
        type: "",
        commentary: ""
    });
    const [isCollapsed, setIsCollapsed] = useState(false);

    const { token, setLoading, user, totalFilas, setTotalFilas, fetchCentros, centros, fetchServicios, servicios } =
        useContext(AppContext);
    // console.log(user);

    const [formData, setFormData] = useState({
        eco: "",
        type: "",
        project_id: id,
        user_id: user.id,
        commentary: "",
        extra_projects: [],
    });

    const [formDataEdit, setFormDataEdit] = useState({
        centre_id: "",
        service_id: "",
        date: "",
    });

    const fetchProyecto = async () => {
        try {
            const res = await clienteAxios.get(`/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProyecto(res.data);
            setFormDataEdit({
                centre_id: res.data.centre.id,
                service_id: res.data.service.id,
                date: res.data.date,
            });
            setVehiculos(res.data.vehicles);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el proyecto");
        }
    };

    const fetchTypes = async () => {
        try {
            const res = await clienteAxios.get(`/api/vehicles-types`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTypes(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los tipos de vehículos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.post(
                `/api/projects/${id}/add-vehicle`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchProyecto();
            setModalAgregarOpen(false);
            toast.success("Vehículo agregado correctamente");
            setFormData({
                centre_id: "",
                service_id: "",
                date: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error during request:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            icon: "warning",
            title: "¿Estás seguro de querer editar el proyecto?",
            text: "En caso de cambiar de centro de ventas, los vehículos también serán reasignados.",
            confirmButtonText: "Aceptar",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            ...swalConfig(),
        });

        if (!result.isConfirmed) {
            return;
        }


        setLoading(true);

        try {
            const { data } = await clienteAxios.put(`/api/projects/${id}`,
                formDataEdit,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchProyecto();
            setEditando(false);
            toast.success("Proyecto actualizado correctamente");
            setErrors({});
        } catch (error) {
            console.error("Error during request:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProyectosAbiertos = async (e) => {
        try {
            const res = await clienteAxios.get(
                `/api/centres/${proyecto.centre.id}/open-projects`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setProyectosAbiertos(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el proyecto");
        }
    };

    const handleEliminarVehiculo = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            icon: "warning",
            title: "¿Estás seguro de querer eliminar el vehículo del proyecto?",
            confirmButtonText: "Sí, eliminar vehículo.",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            ...swalConfig(),
        });

        if (!result.isConfirmed) {
            return;
        }

        setLoading(true);
        try {
            const { data } = await clienteAxios.post(
                `/api/projects/${id}/remove-vehicle`,
                { id: vehiculo.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchProyecto();
            setModalConsultarOpen(false);
            setVehiculo({});
            toast.success("Vehículo eliminado correctamente");
            setErrors({});
        } catch (error) {
            console.error("Error during request:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCerrarProyecto = async (e) => {
        e.preventDefault();

        const closeProject = async () => {
            const result = await Swal.fire({
                title: "¿Estás seguro de querer cerrar el proyecto?",
                text: "No podrás agregar más vehículos.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, cerrar proyecto",
                cancelButtonText: "Cancelar",
                ...swalConfig(),
            });

            if (result.isConfirmed) {
                setLoading(true);

                try {
                    const { data } = await clienteAxios.post(
                        `/api/projects/${id}/close`,
                        { id: vehiculo.id },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    fetchProyecto();
                    setModalConsultarOpen(false);
                    setVehiculo({});
                    toast.success("Proyecto cerrado correctamente");
                    setErrors({});
                } catch (error) {
                    console.error("Error during request:", error);
                    if (error.response && error.response.data.errors) {
                        setErrors(error.response.data.errors);
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        closeProject();
    };

    const handleEliminarProyecto = async (e) => {
        e.preventDefault();

        const closeProject = async () => {
            const result = await Swal.fire({
                title: "¿Estás seguro de querer eliminar el proyecto?",
                text: "Esta acción es irreversible.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar proyecto",
                cancelButtonText: "Cancelar",
                ...swalConfig(),
            });

            if (result.isConfirmed) {
                setLoading(true);

                try {
                    const { data } = await clienteAxios.delete(
                        `/api/projects/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setModalConsultarOpen(false);
                    navigate("/proyectos");
                    toast.success("Proyecto eliminado exitosamente.");
                } catch (error) {
                    console.error("Error during request:", error);
                    if (error.response && error.response.data.errors) {
                        setErrors(error.response.data.errors);
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        closeProject();
    };

    const toggleProyectoExtra = (item) => {
        setFormData((prevFormData) => {
            const extraProjects = Array.isArray(prevFormData.extra_projects)
                ? [...prevFormData.extra_projects]
                : []; // Asegúrate de que sea un array
            if (extraProjects.includes(item)) {
                // Si el elemento ya está en el array, lo eliminamos
                return {
                    ...prevFormData,
                    extra_projects: extraProjects.filter(
                        (project) => project !== item
                    ),
                };
            } else {
                // Si el elemento no está en el array, lo agregamos
                return {
                    ...prevFormData,
                    extra_projects: [...extraProjects, item],
                };
            }
        });
    };

    const textAreaRef = useRef(null);

    const copyTextToClipboard = () => {
        if (textAreaRef.current) {
            textAreaRef.current.select();
            document.execCommand("copy");
            toast.success("Texto copiado al portapapeles");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchProyecto();
            await fetchCentros();
            await fetchServicios();
            await fetchTypes();
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (proyecto.centre && proyecto.centre.id) {
            fetchProyectosAbiertos();
        }
    }, [proyecto.centre]); // Se ejecuta cuando proyecto.centre cambia

    const columns = [
        {
            title: "Económico",
            field: "eco",
            headerFilter: "number",
            // headerFilterParams: { type: "number" },
            resizable: false,
        },
        {
            title: "Tipo",
            field: "type",
            headerFilter: "input",
            resizable: false,
        },
        {
            title: "Comentario",
            field: "commentary",
            headerFilter: "input",
            resizable: false,
            width: 250,
        },
        {
            title: "Fecha y hora de registro",
            field: "created_at",
            // headerFilter: "input",
            formatter: (cell) => {
                const date = cell.getValue();
                console.log(date);
                return format(date, {"date": "short", "time": "short"}, "es");
            },
            // headerFilterFunc: (headerValue, rowValue) => {
            //     if (!headerValue) return true; // sin filtro, mostrar todo
            //     const formatted = formatDateTime(rowValue); // rowValue es el valor original (created_at)
            //     return formatted
            //         .toLowerCase()
            //         .includes(headerValue.toLowerCase());
            // },
            resizable: false,
            width: 250,
        },
    ];

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <h2 className="title-2 mb-0">Proyecto No. {proyecto?.id}</h2>
                <button
                    onClick={() => {
                        setEditando((prev) => !prev);
                        // console.log(editando);
                    }}
                    className="cursor-pointer"
                >
                    <Pencil className="text w-5" />
                </button>
            </div>
            <div className="pl-3">
                <p className="text">
                    <span className="font-bold">Servicio:</span>{" "}
                    {proyecto?.service?.name}
                </p>
                <p className="text">
                    <span className="font-bold">Centro de ventas:</span>{" "}
                    {proyecto?.centre?.name}{" "}
                </p>
                <p className="text">
                    <span className="font-bold">Fecha:</span> {format(proyecto?.date, "full", "es")}
                </p>
            </div>

            <div className="flex gap-2 mt-2">
                {user?.role === "admin" && proyecto?.is_open ? (
                    <button
                        className="btn btn-secondary mt-0"
                        onClick={handleCerrarProyecto}
                    >
                        <ClipboardCheck />
                        Cerrar
                    </button>
                ) : null}

                {user?.role === "admin" && (
                    <button
                        className="btn btn-danger mt-0"
                        onClick={handleEliminarProyecto}
                    >
                        <Trash2 /> Eliminar
                    </button>
                )}
            </div>

            <h3 className="title-3 mt-2 mb-2">Lista de vehículos</h3>
            <div className="flex gap-2 mt-0">
                {proyecto?.is_open ? (
                    <button
                        className="btn mt-0"
                        onClick={() => {
                            setModalAgregarOpen(true);
                        }}
                    >
                        <Car />
                        Agregar
                    </button>
                ) : (
                    <p className="text-muted mb-2">
                        El proyecto ha sido cerrado, no es posible agregar más
                        vehículos.
                    </p>
                )}
            </div>

            <Tabla
                options={{
                    pagination: "local",
                    paginationSize: 20,
                    layout: "fitDataFill",
                }}
                events={{
                    rowClick: (e, row) => {
                        setVehiculo(row.getData());
                        setModalConsultarOpen(true);
                    },
                }}
                columns={columns}
                data={vehiculos}
            />

            <Modal isOpen={editando} onClose={() => setEditando(false)}>
                <h3 className="title-3">Editar proyecto</h3>
                <form action="">
                    <label className="label" htmlFor="centre_id">
                        Centro de ventas
                    </label>
                    <select
                        id="centre_id"
                        className="input"
                        onChange={(e) =>
                            setFormDataEdit({
                                ...formDataEdit,
                                centre_id: e.target.value,
                            })
                        }
                        value={formDataEdit?.centre_id || ""}
                    >
                        <option value="" disabled>
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
                            setFormDataEdit({
                                ...formDataEdit,
                                service_id: e.target.value,
                            })
                        }
                        value={formDataEdit?.service_id || ""}
                    >
                        <option value="" disabled>
                            Seleccione un servicio
                        </option>
                        {servicios.map((centro) => (
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
                        value={formDataEdit?.date}
                        // defaultValue={formData.date || new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                            setFormDataEdit({
                                ...formDataEdit,
                                date: e.target.value,
                            })
                        }
                    />
                    {errors.date && (
                        <p className="text-red-500">{errors.date[0]}</p>
                    )}

                    <button
                        className="btn mt-4"
                        type="submit"
                        onClick={handleSubmitEdit}
                    >
                        <Save />
                        Guardar
                    </button>
                </form>
            </Modal>

            <ErrorBoundary>
                <Modal
                    isOpen={isModalAgregarOpen}
                    onClose={() => setModalAgregarOpen(false)}
                >
                    <h2 className="title-3">Agregar vehículo al proyecto</h2>
                    <form action="">
                        <label className="label" htmlFor="eco">
                            Económico
                        </label>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                            <div>
                                <input
                                    className="input"
                                    type="number"
                                    id="eco"
                                    placeholder="Económico"
                                    value={formData.eco}
                                    min={1}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            eco: e.target.value,
                                        });
                                    }}
                                    autoComplete="off"
                                    autoFocus
                                />
                                {errors.eco && (
                                    <p className="error">{errors.eco[0]}</p>
                                )}
                            </div>
                        </div>

                        <label className="label" htmlFor="type">
                            Tipo de vehículo
                        </label>
                        <select
                            className="input"
                            id="type"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value,
                                })
                            }
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Seleccione un tipo
                            </option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.type}
                                </option>
                            ))}
                        </select>
                        {errors.type && (
                            <p className="error">{errors.type[0]}</p>
                        )}

                        <label className="label" htmlFor="commentary">
                            Comentario (opcional)
                        </label>
                        <textarea
                            name=""
                            id="commentary"
                            placeholder="Comentario"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    commentary: e.target.value,
                                })
                            }
                        ></textarea>
                        {errors.commentary && (
                            <p className="error">{errors.commentary[0]}</p>
                        )}

                        {proyectosAbiertos?.length > 1 && (
                            <div>
                                <label
                                    className="label flex"
                                    // htmlFor="other-projects"
                                    onClick={() =>
                                        setIsCollapsed((prev) => !prev)
                                    }
                                >
                                    <ChevronRight
                                        className={
                                            isCollapsed ? "block" : "hidden"
                                        }
                                    />
                                    <ChevronDown
                                        className={
                                            !isCollapsed ? "block" : "hidden"
                                        }
                                    />
                                    Agregar a otros proyectos de forma
                                    simultánea (opcional)
                                </label>
                                <div
                                    className={`pl-2 pt-2 flex flex-wrap gap-1 overflow-hidden ${
                                        isCollapsed ? "max-h-0" : null
                                    }`}
                                >
                                    {proyectosAbiertos.map((p) =>
                                        p.id != id ? (
                                            <label
                                                className="inline-flex items-center text-xs mt-0"
                                                key={p.id}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-btn peer"
                                                    onChange={() =>
                                                        toggleProyectoExtra(
                                                            p.id
                                                        )
                                                    }
                                                    checked={formData?.extra_projects?.includes(
                                                        p.id
                                                    )}
                                                />
                                                <span className="checkbox-label peer-checked:bg-blue-500 peer-checked:text-white peer-checked:ring-blue-500">
                                                    {p.service}
                                                </span>
                                            </label>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 mt-2">
                            <input
                                className="btn"
                                type="submit"
                                value="Registrar"
                                onClick={handleSubmit}
                            />

                            {/* <MobileScanner
                                onDetect={(codigo) =>{
                                    //eliminar caracteres no deseados
                                    let codigoR = codigo.replace(/[^0-9]/g, "");
                                    console.log(codigoR);
                                    const match = codigoR.match(/\b\d{5}\b/);

                                    if (match) {
                                        setFormData({ ...formData, eco: parseInt(codigoR) });
                                    }

                                }
                                }
                            /> */}
                        </div>
                    </form>
                </Modal>
            </ErrorBoundary>

            <Modal
                isOpen={isModalConsultarOpen}
                onClose={() => setModalConsultarOpen(false)}
            >
                <h2 className="title-3">Vehículo</h2>
                <div className="flex flex-col gap-3 pl-2">
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Económico
                        </span>{" "}
                        <p>{vehiculo?.eco}</p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Tipo
                        </span>{" "}
                        <p>{vehiculo?.type}</p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Comentario
                        </span>{" "}
                        <p>
                            {vehiculo?.commentary ??
                                "-"}
                        </p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Fecha y hora de registro
                        </span>{" "}
                        <p>{format(vehiculo?.created_at, { date: "full", time: "medium" }, "es")}</p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Registrado por
                        </span>{" "}
                        <p>
                            {vehiculo?.user?.name} {vehiculo?.user?.last_name}
                        </p>
                    </div>
                </div>

                <div className="md:flex gap-1">
                    <button
                        className="btn btn-danger"
                        onClick={handleEliminarVehiculo}
                    >
                        <Trash2 />
                        Eliminar del proyecto
                    </button>
                    <button
                        className="btn"
                        onClick={() => {
                            setModalConsultarOpen(false);
                        }}
                    >
                        <CircleCheck />
                        Aceptar
                    </button>
                </div>
            </Modal>

            {user?.role === "admin" && vehiculos.length > 0 && (
                <div>
                    <h3 className="title-3 mt-5 mb-2">
                        Económicos en serie (para copiar y pegar)
                    </h3>
                    <div className="relative">
                        <textarea
                            ref={textAreaRef}
                            className="mt-2"
                            value={vehiculos.map((v) => v.eco).join(", ")}
                            // ref={(textarea) => (this.textArea = textarea)}
                            readOnly
                        />
                        <button
                            className="absolute top-1 right-2 bg-white border border-gray-300 rounded-md p-1"
                            onClick={copyTextToClipboard}
                        >
                            <ClipboardCopy className="text-gray-500" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
