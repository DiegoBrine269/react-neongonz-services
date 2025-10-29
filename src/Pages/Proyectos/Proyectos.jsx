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


export default function Proyectos() {

    // const [servicios, setServicios] = useState([]);
    const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const { token, setLoading, user, fetchServicios, fetchCentros, centros, servicios, mostrarCerrados, setMostrarCerrados} = useContext(AppContext);

    const [isModalOpen, setModalOpen] = useState(false);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const  inputBuscarServicioRef  = useRef(null);
    const [serviciosFiltrados, setServiciosFiltrados] = useState(servicios);
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
            await mutate(url);
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

    const normalize = (s) =>  s
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";

      // Fuse minimal: usa el mismo campo, pero normalizado por getFn
    const fuse = useMemo(
        () =>
        new Fuse(servicios, {
            keys: ["name"],
            threshold: 0.3,
            ignoreLocation: true,
            minMatchCharLength: 1,
            getFn: (obj) => normalize(obj.name), // 👈 normaliza solo aquí
        }),
        [servicios]
    );

    const showClosed = mostrarCerrados ? 1 : 0;
    const url = token ? `/api/projects?show_closed=${showClosed}` : null;
    const fetcher = async (url) => {
        const res = await clienteAxios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    };

    // Hook SWR
    const { data: proyectos, error, isLoading } = useSWR(url, fetcher);

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

    useEffect(() => {
        setServiciosFiltrados(servicios);
    }, [servicios]);


    const handleSelectServicios = ()=> {
        flushSync(() => setMostrarSugerencias(true));
        inputBuscarServicioRef?.current.focus();
    };

    const handleClickServicio = (e)=> {
        const servicioId = e.currentTarget.getAttribute("value");
        const servicioName = e.currentTarget.textContent;

        setFormData({
            ...formData,
            service_id: servicioId,
            service_name: servicioName,
        });

        setMostrarSugerencias(false);
    };


    const handleFiltrarServicios = (e)=> {
        // const texto = e.target.value.trim();
        // if (texto === "") {
        //     setServiciosFiltrados(servicios);
        //     return;
        // }

        // const resultados = fuse.search(texto);
        // setServiciosFiltrados(resultados.map((r) => r.item));

            const q = normalize(e.target.value.trim());
            if (!q) return setServiciosFiltrados(servicios);
            const res = fuse.search(q).map((r) => r.item);
            setServiciosFiltrados(res);
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
            headerFilter: "input",
            resizable: false,
        },
        {
            title: "Fecha",
            field: "date",
            headerFilter: "input",
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
            headerFilter: "input",
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
                            setMostrarCerrados(!mostrarCerrados);
                        }}
                    />
                    <span className="text">Mostrar proyectos cerrados</span>
                </label>
            )}

            <Tabla
                className="custom-table"
                options={{
                    pagination: "local",
                    paginationSize: 20,
                    layout: "fitDataStretch",
                }}
                events={{
                    rowClick: handleRowClick,
                }}
                columns={columns}
                data={proyectos}
                title="Listado de proyectos"
            />

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
                        defaultValue=""
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
                    {<ErrorLabel>{errors.centre_id}</ErrorLabel>}

                    <label className="label" htmlFor="service_id">
                        Servicio
                    </label>


                    <div className="relative">
                        <input type="text" name="" id="service" autoComplete="false" placeholder="Elige un servicio" readOnly onClick={handleSelectServicios} value={formData.service_name ?? ""}/>
                        {<ErrorLabel>{errors.service_id}</ErrorLabel>}
                        {/* Sugerencias */}
                        {<div className={`${mostrarSugerencias? 'absolue' : 'hidden'} max-w-full rounded-md cursor-pointer p-3 bg-white dark:bg-neutral-800 w-full top-full border shadow-2xl`}>
                            

                            <input ref={inputBuscarServicioRef} type="text" className="input sticky top-0" placeholder="Buscar servicio" onChange={handleFiltrarServicios}/>

                            <div className="overflow-scroll max-h-40 h-auto">
                                {serviciosFiltrados.map((s) => (
                                    <div 
                                        key={s.id} 
                                        value={s.id} 
                                        className="text  px-2 py-1 border-b-1 cursor-pointer hover:dark:bg-neutral-800 hover:bg-gray-200"
                                        onClick={handleClickServicio}
                                    >
                                        {s.name}
                                    </div>
                                ))}

                            </div>
                        </div>}
                    </div>

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
                        Comentario
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
