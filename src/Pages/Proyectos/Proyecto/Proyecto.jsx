import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState, useEffect, useRef, useCallback  } from "react";
import { AppContext } from "@/context/AppContext";
import clienteAxios from "@/config/axios";
import { toast } from "react-toastify";
import Modal from "@/components/Modal";
import Swal from "sweetalert2";
import Tabla from "@/components/Tabla";
import { swalConfig } from "@/config/variables";
import { ClipboardCopy, Trash2, Car, CircleCheck, ChevronDown, ChevronRight, Pencil,Save, Camera as CameraIcon } from "lucide-react";
import ErrorBoundary from '@/components/ErrorBoundary';
import { format } from "@formkit/tempo";
import RadioButtonItem from "@/components/RadioButtonItem";
// import { Calendar } from "primereact/calendar";
// import "primereact/resources/themes/lara-light-cyan/theme.css";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {ClipLoader} from "react-spinners";

import ErrorLabel from "@/components/UI/ErrorLabel";
import ProyectoInfo from './ProyectoInfo';
import ProyectoActions from "./ProyectoActions";
import InfoRow from "@/components/UI/InfoRow";
import CopyField from "./CopyField";
import useSWR, {mutate} from "swr";

import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

export default function Proyecto() {
    const navigate = useNavigate();



    const { id } = useParams();
    const [editando, setEditando] = useState(false);
    const [proyectosAbiertos, setProyectosAbiertos] = useState([]);
    // const [proyecto, setProyecto] = useState({});
    const [vehiculos, setVehiculos] = useState([]);
    const [isModalAgregarOpen, setModalAgregarOpen] = useState(false);
    const [isModalConsultarOpen, setModalConsultarOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [vehiculo, setVehiculo] = useState({
        eco: "",
        type: "",
        commentary: ""
    });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [filtrosColapsados, setFiltrosColapsados] = useState(false);
    const formFiltrosRef = useRef(null);
    const textAreaRef = useRef(null);

    const [filtros, setFiltros] = useState([]);
    const [selectingDate, setSelectingDate] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
        
    const [tesseractError, setTesseractError] = useState(null);

    const webcamRef = useRef(null);

    // Sets para los filtros
    const [usuarios, setUsuarios] = useState([]);
    const [tipos, setTipos] = useState([]);

    //Se activa cuando se está agregando un vehículo
    const [fetching, setFetching] = useState(false);
    

    const [usarPlaca, setUsarPlaca] = useState(false);

    const { token, setLoading, user,  fetchCentros, centros, fetchServicios, servicios, tableRef, fetchTypes, types } = useContext(AppContext);
    
    const requestHeader = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const { data: proyecto, error, isLoading } = useSWR(
        token ? [`/api/projects/${id}`, token] : null, // null evita llamadas si no hay token
        ([url, token]) => fetcher(url, token),
        {
            refreshInterval: 30000,
            revalidateOnFocus: true, 
            revalidateOnReconnect: false, // no recarga al reconectarse
            shouldRetryOnError: false, // evita reintentos infinitos
        }
    );

    const [formData, setFormData] = useState({
        eco: "",
        type: "",
        project_id: id,
        user_id: user.id,
        commentary: "",
        extra_projects: [],
        usar_placa: usarPlaca,
    });

    const [formDataEdit, setFormDataEdit] = useState({
        centre_id: "",
        service_id: "",
        date: "",
        extra_projects: [],
    });

    const fetcher = (url, token) =>
        clienteAxios.get(url, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
    }).then(res => res.data);




    const handleSubmit = async (e) => {
        e.preventDefault();

        

        if (formData.centre_id && formData.centre_id !== proyecto.centre_id) {
            const swalResult = await Swal.fire({
                icon: "warning",
                title: "Atención",
                text: `El vehículo que ingresaste pertenece a ${centros.find(c => c.id == formData.centre_id).name}. Si continúas, el vehículo será reasignado de centro.`,
                confirmButtonText: "Aceptar",
                showCancelButton: true,
                cancelButtonText: "Cancelar",
                ...swalConfig({ danger: true }),
            });
    
            if (!swalResult.isConfirmed) {
                return;
            }
        }



        setLoading(true);

        try {
            const { data } = await clienteAxios.post(
                `/api/projects/${id}/add-vehicle`,
                formData,
                requestHeader
            );
            // fetchProyecto();
            mutate([`/api/projects/${id}`, token]);
            setModalAgregarOpen(false);
            toast.success("Vehículo agregado correctamente");
            setFormData({
                centre_id: "",
                service_id: "",
                date: "",
            });
            setErrors({});
            setUsarPlaca(false);
            setFiltrosColapsados(false);
        } catch (error) {
            // toast.error("Error al agregar el vehículo");
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false)
            formFiltrosRef.reset();
            tableRef.current.clearFilter();
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
                requestHeader
            );

            // fetchProyecto();
            mutate([`/api/projects/${id}`, token]);
            setEditando(false);
            toast.success("Proyecto actualizado correctamente");
            setErrors({});
        } catch (error) {
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
                requestHeader
            );
            setProyectosAbiertos(res.data);
            if(res.data.length > 5 )
                setIsCollapsed(true);
        } catch (error) {
            console.error("Error al cargar el proyecto", error);
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
                requestHeader
            );
            // fetchProyecto();
            mutate([`/api/projects/${id}`, token]);
            setModalConsultarOpen(false);
            setVehiculo({});
            toast.success("Vehículo eliminado correctamente");
            setErrors({});
        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatusProyecto = async (e) => {
        e.preventDefault();

        const closeProject = async () => {
            const result = await Swal.fire({
                title: `¿Estás seguro de querer ${proyecto?.is_open ? "cerrar" : "abrir"} el proyecto?`,
                // text: "No podrás agregar más vehículos.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: `Sí, ${proyecto?.is_open ? "cerrar" : "abrir"} proyecto`,
                cancelButtonText: "Cancelar",
                ...swalConfig(),
            });

            if (result.isConfirmed) {
                setLoading(true);

                try {
                    const { data } = await clienteAxios.post(
                        `/api/projects/${id}/toggle-status`,
                        { id: vehiculo.id },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    // fetchProyecto();
                    mutate([`/api/projects/${id}`, token]);
                    setModalConsultarOpen(false);
                    setVehiculo({});

                    const mensaje = proyecto?.is_open ? "Proyecto cerrado exitosamente." : "Proyecto abierto exitosamente." ;

                    toast.success(mensaje);
                    setErrors({});
                } catch (error) {
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

    const duplicarProyecto = async () => {
        const result = await Swal.fire({
            title: "¿Estás seguro de querer duplicar el proyecto?",
            // text: "Esta acción es irreversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, duplicar proyecto",
            cancelButtonText: "Cancelar",
            ...swalConfig(false),
        });

        if (result.isConfirmed) {
            setLoading(true);

            try {
                const { data } = await clienteAxios.post(`/api/projects/${id}/duplicate`,{},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setModalConsultarOpen(false);
                navigate("/proyectos");
                toast.success("Proyecto duplicado exitosamente.");
            } catch (error) {
                if (error.response && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDuplicarProyecto = async (e) => {
        e.preventDefault();
        duplicarProyecto();
    };

    const handleEliminarProyecto = async (e) => {
        e.preventDefault();

        const deleteProject = async () => {
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
                    if (error.response && error.response.data.errors) {
                        setErrors(error.response.data.errors);
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        deleteProject();
    };

    const toggleItemInArray = (setter, key, item) => {
        setter((prevState) => {
            const array = Array.isArray(prevState[key]) ? [...prevState[key]] : [];
            if (array.includes(item)) {
                // Remove the item if it exists
                return {
                    ...prevState,
                    [key]: array.filter((i) => i !== item),
                };
            } else {
                // Add the item if it doesn't exist
                return {
                    ...prevState,
                    [key]: [...array, item],
                };
            }
        });
    };

    const toggleProyectoExtra = (item) => {
        toggleItemInArray(setFormData, "extra_projects", item);
    };

    const toggleProyectoExtraEdit = (item) => {
        toggleItemInArray(setFormDataEdit, "extra_projects", item);
    };


    const copyTextToClipboard = () => {
        if (textAreaRef.current) {
            textAreaRef.current.select();
            document.execCommand("copy");
            toast.success("Texto copiado al portapapeles");
        }
    };

    const filtrarTabla = (e, columna) => {
        let valor = "";

        if (e && e.target) {
            valor = e.target.value;
        } else {
            valor = e;
        }

        const nuevosFiltros = [...filtros.filter((f) => f.field !== columna)];

        if (columna === "created_at") {
            const fechaInicio = new Date(valor);
            const fechaFin = new Date(valor);
            fechaFin.setDate(fechaFin.getDate() + 1);

            nuevosFiltros.push(
                { field: columna, type: ">=", value: fechaInicio.toISOString() },
                { field: columna, type: "<", value: fechaFin.toISOString() }
            );
        } else {
            nuevosFiltros.push({
                field: columna,
                type: "like",
                value: valor,
            });
        }

        setFiltros(nuevosFiltros); // guarda en estado
        tableRef.current.setFilter(nuevosFiltros); // actualiza todos los filtros activos
    };


    useEffect(() => {
        const fetchData = async () => {
            await fetchCentros();
            await fetchServicios();
            await fetchTypes();
            // await fetchProyectosAbiertos();
        };

        fetchData();
    }, []);



    useEffect(() => {
        if (proyecto) {
            // console.log(proyecto.centre.id);
            setFormDataEdit({
                centre_id: proyecto.centre.id,
                service_id: proyecto.service.id,
                date: proyecto.date,
                commentary: proyecto.commentary || "",
            });

            setVehiculos(proyecto.vehicles);

            setUsuarios([...new Set(proyecto.vehicles.map((v) => v.user?.name))]);
            setTipos([...new Set(proyecto.vehicles.map((v) => v.type))]);
            // fetchProyectosAbiertos();

            if (proyecto?.related_projects){
                setFormDataEdit({...formDataEdit, extra_projects: JSON.parse(proyecto?.related_projects),});
                setFormData({...formData, extra_projects: JSON.parse(proyecto?.related_projects),});
            }

            // if (proyecto.centre && proyecto.centre.id) {
            //     fetchProyectosAbiertos();
            // }
        }

    }, [proyecto]);

    useEffect(() => {
        if (proyecto?.centre?.id) {
            fetchProyectosAbiertos();
        }
    }, [proyecto?.centre?.id]);


    const fetchTypesOnEcoChange = async () => {
        try {

            if(formData.eco === "" || formData?.eco?.length < 5)
                return;
            
            setFetching(true);

            const res = await clienteAxios.get(
                `/api/vehicles/${formData.eco}`,
                requestHeader
            );
            if (res.data.vehicle_type_id && res.data.vehicle_type_id !== formData.type) {
                setFormData((prev) => ({
                    ...prev,
                    type: res.data.vehicle_type_id,
                    centre_id: res.data.centre_id
                }));
            }
            else {
                setFormData((prev) => ({
                    ...prev,
                    type: "",
                    centre_id: ""
                }));
            }
        } catch (error) {
            console.error(error);
        }
        finally{
            setFetching(false);
        }
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTypesOnEcoChange();
        }, 100);

        // Limpieza del timeout anterior si cambia formData.eco rápido
        return () => clearTimeout(timer);
    }, [formData.eco]);


    const handleAbrirCamara = () => {

    }


    const columns = [
        {
            title: "Eco.",
            field: "eco",
            resizable: false,
            width: 85,
        },
        {
            title: "Tipo",
            field: "type",
            resizable: false,
            width: 100,
        },
        {
            title: "Registrado por",
            field: "user.name",
            resizable: false,
            width: 100,

        },
        {
            title: "Fecha y hora de registro",
            field: "created_at",
            formatter: (cell) => {
                const date = cell.getValue();
                return format(date, { date: "short", time: "short" }, "es");
            },
            accessorDownload: (value) => format(value, "YYYY-MM-DD HH:mm:ss"),
            // mutator: (value, data, type, params, component) => {
            //     // value viene en crudo (ISO) — devolvemos la versión formateada usada en la celda
            //     const fecha = new Date(value);

            //     return fecha.toLocaleString()
            // },
            resizable: false,
            width: 180,
        },

        {
            title: "Comentario",
            field: "commentary",
            resizable: false,
        },
    ];

    
    return (
        <div className="relative">
                {/* <Camera
                    // onTakePhoto = { (dataUri) => { handleTakePhoto(dataUri); } }
                /> */}
            <div className="flex items-center gap-2 justify-between">
                <h2 className="title-2 mb-0">Proyecto No. {proyecto?.id}</h2>

                <button
                    onClick={() => {
                        setEditando((prev) => !prev);
                    }}
                    className="cursor-pointer"
                >
                    <Pencil className="text w-5" />
                </button>
            </div>

            <ProyectoInfo proyecto={proyecto} />

            <ProyectoActions
                proyecto={proyecto}
                user={user}
                handleToggleStatusProyecto={handleToggleStatusProyecto}
                handleDuplicarProyecto={handleDuplicarProyecto}
                handleEliminarProyecto={handleEliminarProyecto}
            />

            <h3 className="title-3 mt-2 mb-2">Lista de vehículos</h3>
            <div className="contenedor-botones">
                {proyecto?.is_open ? (
                    <button
                        className="btn"
                        onClick={() => {setModalAgregarOpen(true);}}
                    >
                        <Car />
                        Agregar
                    </button>
                ) : (
                    <p className="text-muted mb-2">
                        El proyecto ha sido cerrado, no es posible agregar más vehículos.
                    </p>
                )}
            </div>

            {/* Filtros */}
            <div className="card" ref={formFiltrosRef}>
                <label
                    className="label flex m-0"
                    onClick={() => setFiltrosColapsados((prev) => !prev)}
                >
                    <ChevronRight className={!filtrosColapsados ? "block" : "hidden"}
                    />
                    <ChevronDown className={filtrosColapsados ? "block" : "hidden"}/>
                    <h3 className="text font-bold">Filtros</h3>
                </label>
                <form
                    action=""
                    className={`pl-2 pr-1 flex flex-wrap gap-1 overflow-hidden transition-max-height ${
                        !filtrosColapsados ? "max-h-0" : null
                    }`}
                    onClick={() => {
                        formFiltrosRef.current?.scrollIntoView({
                            behavior: "smooth",
                        });
                    }}
                >

    
                    <input
                        className="input mb-1 mt-2"
                        type="search"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id="eco"
                        placeholder="Económico"
                        onChange={(e) => filtrarTabla(e, "eco")}

                    />


                    <select
                        id="tipo"
                        className="input mb-1"
                        onChange={(e) => filtrarTabla(e, "type")}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Tipo de vehículo
                        </option>
                        {tipos.map((tipo) => (
                            <option key={tipo} value={tipo}>
                                {tipo}
                            </option>
                        ))}
                    </select>

                    <select
                        id="quienRegistra"
                        className="input mb-1"
                        onChange={(e) => filtrarTabla(e, "user.name")}
                        // value={}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Persona que registra
                        </option>
                        {usuarios.map((usuario) => (
                            <option key={usuario} value={usuario}>
                                {usuario}
                            </option>
                        ))}
                    </select>

                    <input
                        readOnly
                        type="text"
                        value={
                            selectedDate
                                ? format(selectedDate, "full", "es")
                                : ""
                        }
                        className="input mb-1"
                        placeholder="Fecha de registro"
                        onFocus={() => setSelectingDate(true)}
                        // onFocus={() => setSelectingDate(true)}
                        // onBlur={() => setSelectingDate(false)}
                    />

                    <input
                        className="input mb-1"
                        type="text"
                        id="comentario"
                        placeholder="Comentario"
                        onChange={(e) => filtrarTabla(e, "commentary")}
                        autoComplete="off"
                    />

                    <div className="flex justify-end">
                        <input
                            // ref={}
                            type="reset"
                            className="btn btn-danger"
                            value="Limpiar filtros"
                            onClick={(e) => {
                                // e.
                                setSelectedDate(null);
                                setFiltros([]);
                                tableRef.current.clearFilter();
                            }}
                        />
                    </div>
                </form>
            </div>

            <Tabla
                title={`${proyecto?.service?.name} - ${proyecto?.centre?.name}`}
                tableRef={tableRef}
                className="custom-table"
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
                    <ErrorLabel>{errors?.centre_id}</ErrorLabel>

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
                    <ErrorLabel>{errors?.service_id}</ErrorLabel>

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
                    <ErrorLabel>{errors?.date}</ErrorLabel>

                    {proyectosAbiertos?.length > 1 && (
                        <div>
                            <label
                                className="label flex"
                                onClick={() => setIsCollapsed((prev) => !prev)}
                            >
                                <ChevronRight
                                    className={isCollapsed ? "block" : "hidden"}
                                />
                                <ChevronDown
                                    className={
                                        !isCollapsed ? "block" : "hidden"
                                    }
                                />
                                Enlazar con otros proyectos
                            </label>
                            <div
                                className={`pl-2 pt-2 flex flex-wrap gap-1 overflow-hidden ${
                                    isCollapsed ? "max-h-0" : null
                                }`}
                            >
                                {proyectosAbiertos.map((p) =>
                                    p.id != id ? (
                                        <RadioButtonItem
                                            key={p.id}
                                            onChange={() =>
                                                toggleProyectoExtraEdit(p.id)
                                            }
                                            checked={formDataEdit?.extra_projects?.includes(
                                                p.id
                                            )}
                                            label={p.service}
                                        />
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}

                    <label className="label" htmlFor="commentary">
                        Comentario
                    </label>
                    <textarea
                        type="date"
                        id="commentary"
                        placeholder="Comentario"
                        value={formDataEdit.commentary}
                        onChange={(e) =>
                            setFormDataEdit({
                                ...formDataEdit,
                                commentary: e.target.value,
                            })
                        }
                    />
                    <ErrorLabel>{errors?.commentary}</ErrorLabel>

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
                    onClose={() => {
                        setModalAgregarOpen(false)
                        setFormData({
                            eco: "",
                            type: "",
                            project_id: id,
                            user_id: user.id,
                            commentary: "",
                            extra_projects: [],
                            usar_placa: false,
                        });
                        setErrors({});
                    }}
                >
                    <h2 className="title-3">Agregar vehículo al proyecto</h2>
                    <form action="">
                        <label
                            htmlFor="usar-placa"
                            className="label flex justify-end items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                name=""
                                id="usar-placa"
                                checked={usarPlaca}
                                onChange={() => {
                                    setFormData({
                                        ...formData,
                                        usar_placa: !usarPlaca,
                                        eco: "",
                                    });
                                    setUsarPlaca((prev) => !prev);
                                }}
                            />
                            Usar no. de placa
                        </label>
                        <label className="label" htmlFor="eco">
                            {usarPlaca ? "No. de placa" : "Económico"}
                        </label>

                        <div>
                            <div className="flex gap-2">
                                <input
                                    className="input"
                                    type={usarPlaca ? "text" : "number"}
                                    id="eco"
                                    placeholder={
                                        usarPlaca ? "No. de placa" : "Económico"
                                    }
                                    value={formData.eco}
                                    min={1}
                                    onChange={(e) => {
                                        setErrors({...errors, eco: null});
                                        setFormData({
                                            ...formData,
                                            eco: e.target.value,
                                        });
                                    }}
                                    autoComplete="off"
                                    autoFocus
                                />
                                <button className="btn bg-green-600" onClick={handleAbrirCamara} type="button">
                                    <CameraIcon/>
                                </button>
                            </div>
                            <ErrorLabel>{errors?.eco}</ErrorLabel>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="label" htmlFor="type">
                                Tipo de vehículo
                            </label>

                            {fetching && (
                                <ClipLoader
                                    className="mt-2"
                                    color="#10B981"
                                    size={20}
                                />
                            )}
                        </div>
                        <select
                            className="input"
                            id="type"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value,
                                })
                            }
                            value={formData.type || ""}
                            // defaultValue=""
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
                        <ErrorLabel>{errors?.type}</ErrorLabel>

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
                            value={formData.commentary || ""}
                        ></textarea>
                        <ErrorLabel>{errors?.commentary}</ErrorLabel>

                        {proyectosAbiertos?.length > 1 && (
                            <div>
                                <label
                                    className="label flex"
                                    onClick={() =>
                                        setIsCollapsed((prev) => !prev)
                                    }
                                >
                                    <ChevronRight className={isCollapsed ? "block" : "hidden"}/>
                                    <ChevronDown className={!isCollapsed ? "block" : "hidden"}/>
                                    Agregar a otros proyectos de forma simultánea (opcional)
                                </label>
                                <div
                                    className={`pl-2 pt-2 flex flex-wrap gap-1 overflow-hidden ${
                                        isCollapsed ? "max-h-0" : null
                                    }`}
                                >
                                    {proyectosAbiertos.map((p) =>
                                        p.id != id ? (
                                            <RadioButtonItem
                                                key={p.id}
                                                onChange={() =>
                                                    toggleProyectoExtra(p.id)
                                                }
                                                checked={formData?.extra_projects?.includes(
                                                    p.id
                                                )}
                                                label={p.service}
                                            />
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
                        </div>
                    </form>
                </Modal>
            </ErrorBoundary>

            <Modal
                isOpen={selectingDate}
                onClose={() => setSelectingDate(false)}
            >
                <DayPicker
                    className="text"
                    animate
                    mode="single"
                    selected={selectedDate}
                    onSelect={(e) => {
                        setSelectingDate(false);
                        setSelectedDate(e);
                        filtrarTabla(e, "created_at");
                    }}
                />
            </Modal>

            <Modal
                isOpen={isModalConsultarOpen}
                onClose={() => setModalConsultarOpen(false)}
            >
                <h2 className="title-3">Vehículo</h2>
                <div className="flex flex-col gap-3 pl-2">
                    <InfoRow label="Económico" value={vehiculo?.eco} />
                    <InfoRow label="Tipo" value={vehiculo?.type} />
                    <InfoRow label="Comentario" value={vehiculo?.commentary ?? "-"} />
                    <InfoRow
                        label="Fecha y hora de registro"
                        value={format(vehiculo?.created_at, { date: "full", time: "medium" },"es")}
                    />
                    <InfoRow
                        label="Registrado por"
                        value={`${vehiculo?.user?.name}`}
                    />
                </div>

                <div className="contenedor-botones">
                    {
                        //Mostrar solo si es del mismo usuario, o bien si es admin
                        (user?.role === "admin" || vehiculo?.user?.id === user?.id)
                        &&
                        <button
                            className="btn btn-danger"
                            onClick={handleEliminarVehiculo}
                        >
                            <Trash2 />
                            Eliminar del proyecto
                        </button>
                    }
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
                <CopyField
                    textAreaRef={textAreaRef}
                    copyTextToClipboard={copyTextToClipboard}
                    vehiculos={vehiculos}
                />
            )}
        </div>
    );
}
