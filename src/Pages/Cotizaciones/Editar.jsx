import { useEffect, useState, useContext, use } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clienteAxios from "@/config/axios";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import { format } from "@formkit/tempo";
import ErrorLabel  from "@/components/UI/ErrorLabel.jsx";
import PeerLabel from "@/components/UI/PeerLabel.jsx";
import TitleCheckBox from "@/components/UI/TitleCheckBox.jsx";
import { useSelection } from "@/hooks/useSelection.js";
import {formatearDinero} from "@/utils/utils.js";
import AnimatedAmount from "@/components/UI/AnimatedAmount";
import { Printer } from "lucide-react";
import { downloadBlobResponse } from "@/utils/downloadFile"; // ajusta ruta según tu estructura


export default function Editar() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [cotizacion, setCotizacion] = useState(null);
    // const [seleccionados, setSeleccionados] = useState([]);
    const [proyectosPendientes, setProyectosPendientes] = useState([]);
    const [vehiculosPendientes, setVehiculosPendientes] = useState([]);

    const [idsPreviamenteSeleccionados, setIdsPreviamenteSeleccionados] = useState([]);

    const [centro, setCentro] = useState({});

    
    const { token, setLoading, responsables, fetchResponsables, fetchCentros, centros } = useContext(AppContext);

    const [seleccionarTodo, setSeleccionarTodo] = useState(false);
    const { selected, toggle, clear, isSelected, setSelected, selectAll } = useSelection();

    const [checkedMap, setCheckedMap] = useState({});
    const [subTotal, setSubTotal] = useState(0);
    const [formData, setFormData] = useState({
        date: format(cotizacion?.date, "YYYY-MM-DD"),

    });

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        // console.log(formData);
        try {
            const response = await clienteAxios.put(
                `/api/invoices/${id}`,
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
            // navigate('/cotizaciones');

        } catch (error) {
            // setErrors()
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
                        // console.error("Error parsing response:", parseError);
                        toast.error("Error desconocido al generar el PDF");
                    }
                };
                reader.readAsText(error.response.data);
                toast.error("Hubo un error al actualizar la cotización");
                return;
            } else {
                toast.error("Error desconocido al generar el PDF");
                return;
            }
        } finally {
            setLoading(false);
            navigate('/cotizaciones');
        }
    };

    const handleCheckboxChange = (name, items, toggleSelected) => (e) => {
        const { checked } = e.target;

        setCheckedMap(prev => ({ ...prev, [name]: checked }));

        items.forEach(item => {
            if(item.project.id === parseInt(name))
                toggleSelected(item, checked);
        });
    };

    const fetchCotizacion = async (id) => {
        try {
            const res = await clienteAxios.get(`/api/invoices/${id}`, {
                headers: {Authorization: `Bearer ${token}`,},
            });
            setCotizacion(res.data);
            setSubTotal(res.data.total);
            
            console.log(res.data.vehicles);
            setIdsPreviamenteSeleccionados(res.data.vehicles.map(v => v.id));
        } catch (error) {
            toast.error("Error al cargar la cotización");
            console.error("Error fetching data:", error);
        }   
    }

    async function fetchVehiculosPendientes() {
        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/vehicles?invoice=pending&editing_invoice=${cotizacion.id}&centre_id=${cotizacion.centre_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // console.log(res.data);
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
            // setVehiculosPendientes([]);
            toast.error("Error al cargar los vehículos");
            console.error("Error fetching data:", error);
        }
        finally
        {
            setLoading(false);
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchCotizacion(id)]);
            await Promise.all([fetchResponsables()]);
            await Promise.all([fetchCentros()]);
            setLoading(false);
        };

        fetchData();

    }, []);

    useEffect(() => {
        if(centros.length === 0) return;
        setCentro(centros.find(c => c.id === cotizacion?.centre_id) || {});
    }, [centros]);

    useEffect(() => {   
        if(!cotizacion) return; 
        const fetchData  = async ()=>  {
            setLoading(true);
            fetchVehiculosPendientes();
            setLoading(false);
        }

        fetchData();
        setFormData({
            ...formData,
            date: format(cotizacion?.date, "YYYY-MM-DD"),
            responsible_id: cotizacion?.responsible_id,
        });
    }, [cotizacion]);


    useEffect(() => {
        let sub = 0;
        let lanzarError = false;

        selected.forEach((s) => {
            if(!s.price){
                lanzarError = true;
                return;
            }
            sub += parseInt(s.price);
        });

        if(lanzarError)
            toast.error("Faltan precios por registrar");
        
        setSubTotal(sub);


        setFormData({
            ...formData,
            vehicles:selected
        });
    }, [selected]);

    useEffect(() => {
        // Selecciona automáticamente los vehículos previamente seleccionados
        if (vehiculosPendientes.length && idsPreviamenteSeleccionados.length) {
            vehiculosPendientes.forEach((v) => {
                if (idsPreviamenteSeleccionados.includes(v.id) && !isSelected(v)) {
                    toggle(v);
                }
            });
        }
        // eslint-disable-next-line
    }, [vehiculosPendientes, idsPreviamenteSeleccionados]);

    return (
        <>
            <h2 className="title-2">Editar {cotizacion?.invoice_number}</h2>

            <form action="">
                <label htmlFor="centre_id" className="label">
                    Centro
                </label>
                <select id="centre_id" defaultValue="" disabled>
                    <option value="">{cotizacion?.centre.name}</option>
                </select>
                <ErrorLabel>{errors?.centre_id}</ErrorLabel>

                <label htmlFor="date" className="label">
                    Fecha
                </label>
                <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <ErrorLabel>{errors?.date}</ErrorLabel>

                <label className="label" htmlFor="correo">
                    Destinatario
                </label>
                <select
                    id="centre_id"
                    className="input"
                    value={formData.responsible_id ?? cotizacion?.responsible_id ?? ""}
                    onChange={(e) => setFormData({...formData, responsible_id: e.target.value})}

                >
                    <option value="" disabled>
                        Seleccione un destinatario
                    </option>
                    {responsables
                        .filter((responsable) =>
                            centro?.responsibles?.some(r => r.id === responsable.id)
                        )
                        .map((responsable) => (
                            <option key={responsable.id} value={responsable.id}>
                                {responsable.name}
                            </option>
                        ))}
                </select>
                <ErrorLabel>{errors?.responsible_id}</ErrorLabel>

                {/* Subtotal */}
                <div className="sticky top-0 text-right my-3">
                    <AnimatedAmount
                        keyProp={subTotal}
                        label={`Subtotal: ${formatearDinero(subTotal)}`}
                    />
                </div>

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
                            if(nuevoValor)
                                selectAll(vehiculosPendientes);
                            else
                                clear();
                            
                            
                        }}
                    />
                    <span className="text">Seleccionar todo</span>
                </label>


                {proyectosPendientes?.map((p) => (
                    <div
                        key={p.id}
                        className="border-1 border-neutral-400 p-2 rounded my-4"
                    >
                        <TitleCheckBox
                            name= {p.id}
                            label= {`${p.service} (${format(p.date,"full","es")})`}
                            checked={checkedMap[p.id] || false}
                            onChange={handleCheckboxChange(p.id, vehiculosPendientes, toggle)}
                        />

                        <div className="flex flex-col gap-2">
                            {(() => {
                                
                                const agrupados ={};

                                vehiculosPendientes?.forEach(
                                    (v) => {
                                        // debugger;
                                        if (v.project.id === p.id) {
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
                                            {vehiculos.map((v) => {
                                                // debugger;
                                                // if(idsPreviamenteSeleccionados.includes(v.id))
                                                //     toggle(v);

                                                return <PeerLabel
                                                    key={v.id}
                                                    value={v.id}
                                                    label={v.eco}
                                                    checked={isSelected(v)}
                                                    onChange={() => toggle(v)}
                                                />
                                            })}
                                        </div>
                                    </div>
                            ));
                            })()}
                        </div>

                    </div>
                ))}

                {selected.length > 0 && (
                    <>
                        

                        <button
                            className="btn mt-4"
                            onClick={handleSubmit}
                        >
                            <Printer />
                            Actualizar
                        </button>
                    </>
                )}

            </form>
        </>
    );
}

