import { useContext, useEffect, useState, useRef, useMemo } from "react";
// import "../../node_modules/react-tabulator/css/materialize/tabulator_materialize.min.css";

import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CirclePlus, Save } from "lucide-react";
import Tabla from "../../components/Tabla";
import { format } from "@formkit/tempo";
import useSWR, { mutate } from "swr";
import { flushSync } from "react-dom";
import Fuse from "fuse.js";
import ErrorLabel from '@/components/UI/ErrorLabel';
import SearchInput from "@/components/UI/SearchInput";


export default function Proyectos() {

    // const [servicios, setServicios] = useState([]);
    const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const { token, setLoading, user, fetchServicios, fetchCentros, centros, servicios, mostrarCerrados, setMostrarCerrados} = useContext(AppContext);

    const [isModalOpen, setModalOpen] = useState(false);
        
    const [reloadKey, setReloadKey] = useState(0);

    const recargarTabla = () => {
        setReloadKey((prev) => prev + 1);
    };

    const [formData, setFormData] = useState({
        centre_id: "",
        service_id: "",
        date: hoy,
    });

    // const fuse = new Fuse(servicios, {
        
    //     keys: ["name"],       // campo a buscar
    //     threshold: 0.3,       // sensibilidad (0 exacto, 1 muy laxo)
    // });

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
            recargarTabla();
            setModalOpen(false);
            toast.success("Servicio creado correctamente");
            setFormData({
                centre_id: "",
                service_id: "",
                date: hoy,
                commentary: "",
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



    

    const showClosed = mostrarCerrados ? 1 : 0;
    // const url = token ? `/api/projects?show_closed=${showClosed}` : null;
    // const fetcher = async (url) => {
    //     const res = await clienteAxios.get(url, {
    //         headers: {
    //             Authorization: `Bearer ${token}`,
    //         },
    //     });
    //     return res.data;
    // };

    // Hook SWR
    // const { data: proyectos, error, isLoading } = useSWR(url, fetcher);

    const handleRowClick = (e, row) => {
        const id = row.getData().id;
        navigate(`/proyectos/${id}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            // setLoading(true);
            // await Promise.all([
                // fetchProyectos();
                fetchCentros();
                fetchServicios();
            // ]);
            setLoading(false);
        };

        fetchData();
    }, []);

    
    const handleServiceSelect = (id, name) => {
        setFormData(prev => ({
            ...prev,
            service_id: id,
            service_name: name,
        }));
    };

    const handleCentreSelect = (id) => {
        setFormData(prev => ({
            ...prev,
            centre_id: id,
        }));
    };

    const columns = [
        {
            title: "No.",
            field: "id",
            headerFilter: "input",
            width: 70,
            resizable: false,
        },
        {
            title: "Nombre",
            field: "service.name",
            headerFilter: "input",
            width: 150,
            resizable: false,
        },
        {
            title: "Centro de ventas",
            field: "centre.name",
            headerFilter: "input",
            width: 150,
            resizable: false,
        },
        {
            title: "No. vehiculos",
            hozAlign: "right",
            field: "total_vehicles",
            // headerFilter: "input",
            resizable: false,
        },
        {
            title: "Fecha",
            field: "date",
            headerFilter: true,
            headerFilterParams: {
                elementAttributes: {
                    type: "date",
                },
            },
            resizable: false,
            formatter: (cell) => {
                const date = new Date(cell.getValue() + "T12:00:00");

                return format(date, "DD/MM/YYYY");
            },
            // formatter: "datetime",
        },
        {
            title: "Estatus",
            field: "is_open",
            // headerFilter: "input",
            formatter: (cell) => {
                return cell.getValue() ? "Abierto" : "Cerrado";
            },
            resizable: false,
            // width: 250,
        },
    ];

    return (
        <>
            <h2 className="title-2">Listado de proyectos</h2>
            <button
                className="btn mb-4"
                onClick={() => {
                    setModalOpen(true);
                }}
            >
                <CirclePlus />
                Nuevo
            </button>

            {user?.role === "admin" && (
                <label
                    htmlFor="mostrarCerrados"
                    className="flex gap-1 justify-end items-center"
                >
                    <input
                        className="h-4 w-4"
                        type="checkbox"
                        id="mostrarCerrados"
                        checked={mostrarCerrados}
                        onChange={() => {
                            recargarTabla();
                            setMostrarCerrados(!mostrarCerrados);
                        }}
                    />
                    <span className="text">Mostrar cerrados</span>
                </label>
            )}

            <Tabla
                key={reloadKey}
                className="custom-table"
                options={{
                        // selectable: true,
                        pagination: true, //enable pagination
                        paginationMode: "remote", //enable remote pagination
                        ajaxURL: `${import.meta.env.VITE_API_URL}/api/projects?show_closed=${showClosed}`, //set url for ajax request
                        ajaxConfig: {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                        filterMode: "remote",
                    }}
                events={{
                    rowClick: handleRowClick,
                }}
                columns={columns}
                title="Listado de proyectos"
            />

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="title-3">Nuevo proyecto</h2>

                <form action="">
                    <label className="label" htmlFor="centre_id">
                        Centro de ventas
                    </label>
                    <SearchInput
                        htmlId="centre_id"
                        lista={centros}
                        error={errors.centre_id}
                        onSelectItem={handleCentreSelect}
                        placeholder="Elige un centro de ventas"
                    />

                    <label className="label" htmlFor="service_id">
                        Servicio
                    </label>

                    <SearchInput
                        htmlId="service_id"
                        lista={servicios}
                        error={errors.service_id}
                        onSelectItem={handleServiceSelect}
                        placeholder="Elige un servicio"
                    />

                    <label className="label" htmlFor="fecha">
                        Fecha
                    </label>
                    <input
                        className="input"
                        type="date"
                        id="fecha"
                        placeholder="fecha"
                        value={formData.date}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                date: e.target.value,
                            })
                        }
                    />
                    {errors.date && (<p className="text-red-500">{errors.date[0]}</p>)}

                    <label className="label" htmlFor="commentary">
                        Comentario (opcional)
                    </label>
                    <textarea
                        type="date"
                        id="commentary"
                        placeholder="Comentario"
                        value={formData.commentary}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                commentary: e.target.value,
                            })
                        }
                    />
                    {errors.commentary && (
                        <p className="text-red-500">{errors.commentary[0]}</p>
                    )}

                    <button
                        className="btn mt-4"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        <Save />
                        Guardar
                    </button>
                </form>
            </Modal>
        </>
    );
}
