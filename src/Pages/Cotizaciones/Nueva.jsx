
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
import ErrorLabel from "@/components/UI/ErrorLabel.jsx";
import {useSelection} from "@/hooks/useSelection";


export default function Nueva() {
    const navigate = useNavigate();
   

    const { token, setLoading, centros, fetchCentros, fetchResponsables, responsables, setLoadingMessage} = useContext(AppContext);

    const [centro, setCentro] = useState("");
    const [errors, setErrors] = useState({});
    const [lanzarError, setLanzarError] = useState(false);

    const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
    const [centrosPendientes, setCentrosPendientes] = useState([]);
    const [proyectosPendientes, setProyectosPendientes] = useState([]);


    const [seleccionarTodo, setSeleccionarTodo] = useState(false);
    const [proyectosSeleccionados, setProyectosSeleccionados] = useState([]);

    const [subTotal, setSubTotal] = useState(0);

    const [formData, setFormData] = useState({
        vehicles: [],
        responsible_id: null,
        comments: null
    });

    const { selected, toggle, clear, isSelected, setSelected, selectAll, handleCheckboxChange, checkedMap, setCheckedMap } = useSelection();



    useEffect(() => {
        if(lanzarError)
            toast.error("Faltan precios por registrar");

    }, [lanzarError]);

    useEffect(()=>{
        // debugger
        let sub = 0;
        const conjuntoSeleccionados = new Set(selected);
    
        setLanzarError(false);

        conjuntoSeleccionados.forEach((s) => {

            if(!s.price){
                setLanzarError(true);
                // lanzarError = true;
                return;
            }
            sub += parseInt(s.price);
        });

        // if(lanzarError)
        //     toast.error("Faltan precios por registrar");
        
        setSubTotal(sub);


        // Eliminado duplicados
        const unicosPorId = Array.from(
            new Map(selected.filter((item) => item !== null)
                    .map((item) => [item.id, item]) // usar `id` como clave
            ).values()
        );

        setFormData({
            ...formData,
            vehicles:unicosPorId
        });
    }, [selected]);


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

            setCentrosPendientes(Array.from(new Set(res.data.map((item) => item))));

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

            // console.log(res.data);  


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
        setLoadingMessage("Generando cotización, espera.");
        // debugger
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

            // console.log(response)

            downloadBlobResponse(response, "Cotización.pdf");

            setErrors({});
            navigate('/cotizaciones');

        } catch (error) {
            console.log(error)
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
                // console.log(mensajeError);
                toast.error('Hubo un error al generar la cotización');
                return;
            } else {
                toast.error("Error desconocido al generar el PDF");
                return;
            }
        } finally {
            setLoading(false);
            setLoadingMessage(null);
        }
    };
    

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchResponsables()]);
            await Promise.all([fetchCentros()]);
            await Promise.all([fetchVehiculosPendientes()]);
            setLoading(false);
        };

        fetchData();
    }, []);



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
        clear();
        setLanzarError(false);
        setProyectosSeleccionados([]);
        setCheckedMap({})
        setFormData({
            vehicles: [],
            responsible_id: null,
            comments: null
        });

        if(centro?.responsibles?.length === 1)
            setFormData({...formData, responsible_id: centro.responsibles[0].id})
    
    
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
                            value={centro ? centro.id : ""} // evita error si centro es null
                            onChange={(e) =>{
                                    // console.log(centrosPendientes);
                                    setCentro(centros.find(c => c.id == e.target.value))

                                }
                            }
                        >
                            <option value="" disabled>
                                Seleccione un centro de ventas
                            </option>
                            {centros
                                .filter((centro) =>
                                    centrosPendientes.some(p => p.centre_id === centro.id)
                                )
                                .map((centro) => (
                                    <option key={centro.id} value={centro.id}>
                                    {centro.name}
                                    </option>
                                ))
                            }
                        </select>

                        <label className="label" htmlFor="correo">
                            Destinatario
                        </label>
                        <select
                            id="centre_id"
                            className="input"
                            value={formData.responsible_id ?? ""}
                            onChange={(e) => setFormData({...formData, responsible_id: e.target.value})}

                        >
                            <option value="" disabled>
                                Seleccione un destinatario
                            </option>
                            {responsables
                                .filter((responsable) =>
                                    centro.responsibles?.some(r => r.id === responsable.id)
                                )
                                .map((responsable) => (
                                    <option key={responsable.id} value={responsable.id}>
                                        {responsable.name}
                                    </option>
                                ))}
                        </select>
                        <ErrorLabel>{errors?.responsible_id}</ErrorLabel>

                    </>
                )}

                {/* Subtotal */}
                {centro  && <div className="sticky top-0 text-right my-3 z-3">
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

                                const nuevoValor = !seleccionarTodo;
                                setSeleccionarTodo(nuevoValor);
                                console.log(vehiculosPendientes)
                                if(nuevoValor)
                                    selectAll(vehiculosPendientes.filter(v => v.centre_id === centro.id))
                                else
                                    clear();

                            }}
                        />
                        <span className="text">Seleccionar todo</span>
                    </label>
                )}

                {centro && (
                    <div className="pt-2">
                        {proyectosPendientes.map((p) =>
                            p.centre_id == centro.id ? (
                                <div
                                    key={p.id}
                                    className="border-1 border-neutral-400 p-2 rounded mb-4"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <TitleCheckBox
                                            name= {p.id}
                                            label= {`${p.service} (${format(p.date,"full","es")})`}
                                            checked={checkedMap[p.id] || false}
                                            onChange={handleCheckboxChange(p.id, vehiculosPendientes, (item) => item.project.id )}
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
                                                                checked={isSelected(v)}
                                                                onChange={() => toggle(v)}

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
                        
                        {selected.length > 0 && !lanzarError && (
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
