import { useState } from "react";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Nueva() {
    const navigate = useNavigate();

    const { token, setLoading, user, totalFilas, setTotalFilas, centros, fetchCentros} = useContext(AppContext);

    const [centro, setCentro] = useState("");
    const [errors, setErrors] = useState({});

    const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
    const [centrosPendientes, setCentrosPendientes] = useState([]);
    const [proyectosPendientes, setProyectosPendientes] = useState([]);

    const [seleccionados, setSeleccionados] = useState([]);
    const [seleccionarTodo, setSeleccionarTodo] = useState(false);


    const [formData, setFormData] = useState({
        vehicles: [],
        comments: null
    });

    const handleCheckboxChange = (item) => {
        setSeleccionados(
            (prev) =>
                prev.includes(item)
                    ? prev.filter((i) => i !== item) // lo quita
                    : [...prev, item] // lo agrega
        );
    };

    useEffect(()=>{
        setFormData({
            ...formData,
            vehicles:seleccionados
        });
    }, [seleccionados]);


    async function fetchVehiculos() {
        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/vehicles?invoice=pending`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCentrosPendientes(Array.from(new Set(res.data.map((item) => item.centre_id))));
            setProyectosPendientes(
                Array.from(
                    res.data
                        .map((item) => item.project) // Extrae los proyectos
                        .reduce((acc, project) => {
                            if (!acc.has(project.id)) {
                                acc.set(project.id, project); // Usa un Map para evitar duplicados
                            }
                            return acc;
                        }, new Map())
                        .values() // Obtén los valores únicos
                )
            );


            setVehiculosPendientes(res.data);
        } catch (error) {
            setVehiculosPendientes([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los vehículos");
        }
        finally
        {
            setLoading(false);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        setLoading(true);

        try {
            const response = await clienteAxios.post(
                `/api/invoices`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Cotización.pdf"); 
            document.body.appendChild(link);
            link.click();
            link.remove();

            setErrors({});
            navigate('/cotizaciones');
            // useNavigate('/cotizaciones');
        } catch (error) {
            console.error("Error during request:", error);
            if (error.response) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const errorData = JSON.parse(reader.result);
                        if (errorData.errors) {
                            setErrors(errorData.errors);
                        }
                    } catch (parseError) {
                        console.error("Error parsing response:", parseError);
                        toast.error("Error desconocido al generar el PDF");
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error("Error desconocido al generar el PDF");
            }
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchCentros()]);

            await Promise.all([fetchVehiculos()]);

            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if(seleccionarTodo){
            console.log("Seleccionando todo");
            // debugger
            vehiculosPendientes.forEach(v => {
                if(v.centre_id == centro && !seleccionados.includes(v)) 
                    setSeleccionados((prev) => [...prev, v]);
            });

            return;
        }    

        setSeleccionados([]);
        
    }, [seleccionarTodo]);


    useEffect(() => {
        setSeleccionarTodo(false);
        setSeleccionados([]);
    }, [centro]);

    return (
        <>
            <h2 className="title-2">Nueva cotización</h2>
            <p className="text">
                Tienes {vehiculosPendientes.length ?? 0} vehículos con
                cotización pendiente
            </p>

            <form action="">

                {
                    vehiculosPendientes.length > 0 && (
                        <>
                            <label className="label" htmlFor="correo">
                                Centro de ventas
                            </label>
                            <select
                                id="centre_id"
                                className="input"
                                value={centro}
                                onChange={(e) => setCentro(e.target.value)}
                                >
                                <option value="" disabled>
                                    Seleccione un centro de ventas
                                </option>
                                {centros
                                    .filter((centro) =>
                                        centrosPendientes.includes(centro.id)
                                )
                                .map((centro) => (
                                    <option key={centro.id} value={centro.id}>
                                            {centro.name}
                                        </option>
                                    ))}
                            </select>
                        </>
                    )
                }

                {vehiculosPendientes.length > 0 && (
                    <label
                        htmlFor="mostrarCerrados"
                        className="flex gap-1 justify-end items-center"
                    >
                        <input
                            className="h-4 w-4"
                            type="checkbox"
                            id="mostrarCerrados"
                            checked={seleccionarTodo}
                            onChange={() => {
                                setSeleccionarTodo(!seleccionarTodo);
                            }}
                        />
                        <span className="text">Seleccionar todo</span>
                    </label>
                )}

                {centro !== "" && (
                    <div className="pt-2">
                        {proyectosPendientes.map((p) =>
                            p.centre_id == centro ? (
                                <div key={p.id}>
                                    <p className="title-3 mb-1 mt-4">
                                        {p.service}
                                    </p>

                                    <div className="flex gap-1 flex-wrap">
                                        {vehiculosPendientes?.map((v) => {
                                            return (
                                                v.project_id == p.id && (
                                                    <label
                                                        className="inline-flex items-center text-xs m-0"
                                                        key={v.id}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox-btn peer"
                                                            value={v.id}
                                                            checked={seleccionados.includes(
                                                                v
                                                            )}
                                                            onChange={(e) => {
                                                                handleCheckboxChange(
                                                                    v
                                                                );
                                                            }}
                                                        />
                                                        <span className="checkbox-label peer-checked:bg-blue-500 peer-checked:text-white peer-checked:ring-blue-500">
                                                            {v.eco}
                                                        </span>
                                                    </label>
                                                )
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null
                        )}

                        {
                            seleccionados.length > 0 && (

                                <>
                                    <label htmlFor="comments" className="label">
                                        Comentarios o instrucciones especiales
                                    </label>
                                    <textarea
                                    value={formData.comments ?? ""}
                                    id="comments"
                                    placeholder="Comentarios o instrucciones especiales"
                                    onChange={e => setFormData({...formData, comments:e.target.value})}
                                    ></textarea>

                                    <button className="btn mt-4" onClick={handleSubmit}>
                                        <Printer />
                                        Generar
                                    </button>
                                </>
                            )
                        }

                        {errors?.vehicles && (
                            <p className="error animate__animated animate__shakeX">
                                {errors?.vehicles[0]}
                            </p>
                        )}
                    </div>
                )}
            </form>
        </>
    );
}
