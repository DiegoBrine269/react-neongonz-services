
import { useState } from "react";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "@formkit/tempo";
import { downloadBlobResponse } from "@/utils/downloadFile"; // ajusta ruta según tu estructura
import PeerLabel from "@/components/UI/PeerLabel";
import TitleCheckBox from "@/components/UI/TitleCheckBox.jsx";
import {formatearDinero} from "@/utils/utils.js";
import AnimatedAmount from "@/components/UI/AnimatedAmount";


export default function Nueva() {
    const navigate = useNavigate();
   

    const { token, setLoading, centros, fetchCentros} = useContext(AppContext);

    const [centro, setCentro] = useState("");
    const [errors, setErrors] = useState({});




    const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
    const [centrosPendientes, setCentrosPendientes] = useState([]);
    const [proyectosPendientes, setProyectosPendientes] = useState([]);

    const [seleccionados, setSeleccionados] = useState([]);
    const [seleccionarTodo, setSeleccionarTodo] = useState(false);
    const [proyectosSeleccionados, setProyectosSeleccionados] = useState([]);

    const [subTotal, setSubTotal] = useState(0);

    const [formData, setFormData] = useState({
        vehicles: [],
        comments: null
    });

    const handleCheckboxChange = (item) => {
        
        const esNuevo = !seleccionados.includes(item);

        setSeleccionados(
            (prev) =>
                    !esNuevo
                    ? prev.filter((i) => i !== item) // lo quita
                    : [...prev, item] // lo agrega
        );

    };

    const handleCheckboxProyectoChange = (e) => {
        const { name, checked } = e.target;

        setProyectosSeleccionados((prev) => ({
            ...prev,
            [name]: checked,
        }));

        vehiculosPendientes.forEach((v) => 
            setSeleccionados((prev) =>
                v.project_id === parseInt(name)
                    ? checked
                        ? [...prev, v]
                        : prev.filter((i) => i !== v)
                    : prev
            )
        );
    };

    useEffect(()=>{

        let sub = 0;
        const conjuntoSeleccionados = new Set(seleccionados);

        let lanzarError = false;

        conjuntoSeleccionados.forEach((s) => {

            if(!s.price){
                lanzarError = true;
                return;
            }
            sub += parseInt(s.price);
        });

        if(lanzarError)
            toast.error("Faltan precios por registrar");
        
        setSubTotal(sub);


        // Eliminado duplicados
        const unicosPorId = Array.from(
            new Map(seleccionados.filter((item) => item !== null)
                    .map((item) => [item.id, item]) // usar `id` como clave
            ).values()
        );

        setFormData({
            ...formData,
            vehicles:unicosPorId
        });
    }, [seleccionados]);


    async function fetchVehiculosPendientes() {
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

            downloadBlobResponse(response, "Cotización.pdf");

            setErrors({});
            navigate('/cotizaciones');

        } catch (error) {
            // console.error("Error during request:", error);
            if (error.response) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const errorData = JSON.parse(reader.result);
                        if (errorData.errors) {

                            setErrors(errorData.errors);
                        }
                    } catch (parseError) {
                        // console.error("Error parsing response:", parseError);
                        toast.error("Error desconocido al generar el PDF");
                    }
                };
                reader.readAsText(error.response.data);
                toast.error("Faltan precios por registrar");
                return;
            } else {
                toast.error("Error desconocido al generar el PDF");
                return;
            }
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchCentros()]);
            await Promise.all([fetchVehiculosPendientes()]);
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if(seleccionarTodo){
            // console.log("Seleccionando todo");
            // debugger
            vehiculosPendientes.forEach(v => {
                if(v.centre_id == centro && !seleccionados.includes(v)) 
                    setSeleccionados((prev) => [...prev, v]);
            });

            return;
        }    

        setSeleccionados([]);
        
    }, [seleccionarTodo]);


    // useEffect(() => {


    //     vehiculosPendientes.forEach(v => {
    //         if(proyectosSeleccionados[v.project_id])
    //             setSeleccionados((prev) => [...prev, v]);
    //         else
    //             setSeleccionados((prev) => prev.filter((i) => i !== v));
    //     });

    // }, [proyectosSeleccionados]);


    useEffect(() => {
        setSeleccionarTodo(false);
        setSeleccionados([]);
        setProyectosSeleccionados([]);
        
    }, [centro]);

    return (
        <>
            <h2 className="title-2">Nueva cotización</h2>
            <p className="text">
                Tienes {vehiculosPendientes.length ?? 0} vehículos con
                cotización pendiente{" "}
            </p>

            <form action="">
                {vehiculosPendientes.length > 0 && (
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
                )}

                {/* Subtotal */}
                {centro  && <div className="sticky top-0 text-right my-3">
                    <AnimatedAmount
                        keyProp={subTotal}
                        label={`Subtotal: ${formatearDinero(subTotal)}`}
                    />
                </div>}

                {centro && vehiculosPendientes.length > 0 && (
                    <label
                        htmlFor="seleccionar-todo"
                        className="flex gap-1 justify-end items-center mt-0"
                    >
                        <input
                            className="h-4 w-4"
                            type="checkbox"
                            id="seleccionar-todo"
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
                                <div
                                    key={p.id}
                                    className="border-1 border-neutral-400 p-2 rounded mb-4"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <TitleCheckBox
                                            name= {p.id}
                                            label= {`${p.service} (${format(p.date,"full","es")})`}
                                            checked={proyectosSeleccionados[p.id] || false}
                                            onChange={handleCheckboxProyectoChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {(() => {
                                            const agrupados = {};

                                            vehiculosPendientes?.forEach(
                                                (v) => {
                                                    if (v.project_id === p.id) {
                                                        if (!agrupados[v.type]) {
                                                            agrupados[v.type] = [];
                                                        }
                                                        agrupados[v.type].push(v);
                                                    }
                                                }
                                            );

                                            // 2. Renderizar los grupos
                                            return Object.entries(agrupados).map(([tipo, vehiculos]) => (
                                                <div key={tipo}>
                                                    <p className="text font-bold mt-1">
                                                        {tipo}
                                                    </p>
                                                    <div className="flex gap-1 flex-wrap pl-2">
                                                        {vehiculos.map((v) => (
                                                            <PeerLabel
                                                                key={v.id}
                                                                value={v.id}
                                                                label={v.eco}
                                                                checked={seleccionados.includes(v)}
                                                                onChange={() => handleCheckboxChange(v)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            ) : null
                        )}

                        {seleccionados.length > 0 && (
                            <>
                                <label htmlFor="comments" className="label">
                                    Comentarios o instrucciones especiales
                                </label>
                                <textarea
                                    value={formData.comments ?? ""}
                                    id="comments"
                                    placeholder="Comentarios o instrucciones especiales"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            comments: e.target.value,
                                        })
                                    }
                                ></textarea>

                                <button
                                    className="btn mt-4"
                                    onClick={handleSubmit}
                                >
                                    <Printer />
                                    Generar
                                </button>
                            </>
                        )}

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
