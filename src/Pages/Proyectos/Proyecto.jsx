import { useParams } from "react-router-dom";
import { use, useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import clienteAxios from "../../config/axios";
import { toast } from "react-toastify";
import { ReactTabulator } from "react-tabulator";
import Modal from "../../components/Modal";
import Swal from "sweetalert2";
// import MobileScanner from "@/components/MobileScanner"; // Ajusta la ruta
import { ClipboardCopy, Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';



export default function Proyecto() {
    const { id } = useParams();
    const [proyecto, setProyecto] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [types, setTypes] = useState([]);
    const [isModalAgregarOpen, setModalAgregarOpen] = useState(false);
    const [isModalConsultarOpen, setModalConsultarOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [vehiculo, setVehiculo] = useState({
        eco: "",
        type: "",
        commentary: "",
    });

    const { token, setLoading, user } = useContext(AppContext);

    const [escuchando, setEscuchando] = useState(false);
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();


    const [formData, setFormData] = useState({
        eco: "",
        type: "",
        project_id: id,
        user_id: user.id,
        commentary: "",
    });

    const fetchProyecto = async () => {
        try {
            const res = await clienteAxios.get(`/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProyecto(res.data);
            setVehicles(res.data.vehicles);
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
        } finally {
            setLoading(false);
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
            resetTranscript()
        } catch (error) {
            console.error("Error during request:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarVehiculo = async (e) => {
        e.preventDefault();

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
                title: "¿Está seguro de cerrar el proyecto?",
                text: "No podrá agregar más vehículos al proyecto.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, cerrar proyecto",
                cancelButtonText: "Cancelar",
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

    const textAreaRef = useRef(null);

    const copyTextToClipboard = () => {
        if (textAreaRef.current) {
            textAreaRef.current.select();
            document.execCommand("copy");
            toast.success("Texto copiado al portapapeles");
        }
    };

    const handleEscuchar = () => {
        if (escuchando) {
            SpeechRecognition.stopListening();
        } else {
            SpeechRecognition.startListening();
        }
        setEscuchando((prev) => !prev);
    };

    useEffect(() => {
        setLoading(true);
        fetchProyecto();
        fetchTypes();
        setLoading(false);
    }, []);

    const columns = [
        {
            title: "Económico",
            field: "eco",
            headerFilter: "input",
            headerFilterParams: { type: "number" },
        },
        {
            title: "Tipo",
            field: "type",
            headerFilter: "input",
        },
        { title: "Comentario", field: "commentary", headerFilter: "input" },
    ];

    return (
        <div className="relative">
            <h2 className="title-2 mb-0">Proyecto</h2>
            <div className="pl-3">
                <p className="text">
                    <span className="font-bold">Número de proyecto:</span>{" "}
                    {proyecto?.id}{" "}
                </p>
                <p className="text">
                    <span className="font-bold">Servicio:</span>{" "}
                    {proyecto?.service?.name}
                </p>
                <p className="text">
                    <span className="font-bold">Centro de ventas:</span>{" "}
                    {proyecto?.centre?.name}{" "}
                </p>
                <p className="text">
                    <span className="font-bold">Fecha:</span> {proyecto?.date}
                </p>
            </div>
            <h3 className="title-3 mt-5 mb-2">Lista de vehículos</h3>
            <div className="flex gap-2 mt-0">
                {proyecto?.is_open ? (
                    <button
                        className="btn mt-0"
                        onClick={() => {
                            setModalAgregarOpen(true);
                        }}
                    >
                        Agregar vehículo
                    </button>
                ) : (
                    <p className="text-muted mb-2">
                        El proyecto ha sido cerrado, no es posible agregar más
                        vehículos.
                    </p>
                )}

                {user?.role === "admin" && proyecto?.is_open  && (
                    <button
                        className="btn-danger mt-0"
                        onClick={handleCerrarProyecto}
                    >
                        Cerrar proyecto
                    </button>
                )}
            </div>
            <div className="overflow-x-scroll ">
                <ReactTabulator
                    columns={columns}
                    data={vehicles}
                    options={{
                        placeholder: "Sin resultados",
                        layout: "fitDataStretch",
                        // resizableColumns: false,
                    }}
                    // layout={"fitData"}
                    events={{
                        rowClick: (e, row) => {
                            setVehiculo(row.getData());

                            setModalConsultarOpen(true);
                        },
                    }}
                />
            </div>
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
                                value={formData.eco || transcript.replace(/\D/g, "")}
                                min={1}
                                onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            eco: e.target.value,
                                        })
                                        resetTranscript()
                                    }
                                }
                                autoComplete="off"
                                autoFocus
                            />
                            {errors.eco && (
                                <p className="error">{errors.eco[0]}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            className={`${escuchando ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                            } p-1 rounded-sm text-white`}
                            onClick={handleEscuchar}
                        >
                            <Mic />
                        </button>
                    </div>

                    <label className="label" htmlFor="type">
                        Tipo de vehículo
                    </label>
                    <select
                        className="input"
                        id="type"
                        onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                        }
                    >
                        <option value="">Seleccione un tipo</option>
                        {types.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.type}
                            </option>
                        ))}
                    </select>
                    {errors.type && <p className="error">{errors.type[0]}</p>}

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

                    <div className="flex gap-2 mt-5">
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
                                "No se registró comentario."}
                        </p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Fecha y hora de registro
                        </span>{" "}
                        <p>{vehiculo?.created_at}</p>
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

                <div className="md:flex gap-2">
                    <button
                        className="btn-danger"
                        onClick={handleEliminarVehiculo}
                    >
                        Eliminar del proyecto
                    </button>
                    <button
                        className="btn"
                        onClick={() => {
                            setModalConsultarOpen(false);
                        }}
                    >
                        Aceptar
                    </button>
                </div>
            </Modal>

            <h3 className="title-3 mt-5 mb-2">Económicos en serie</h3>

            <div className="relative">
                <textarea
                    ref={textAreaRef}
                    className="mt-2"
                    value={vehicles.map((v) => v.eco).join(", ")}
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
    );
}
