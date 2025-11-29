
import { useEffect, useState } from "react";
import { CalendarClock, Printer } from "lucide-react";
import { downloadBlobResponse } from "@/utils/downloadFile"; 
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import clienteAxios from "@/config/axios";
import { toast } from "react-toastify";
import ErrorLabel from "@/components/UI/ErrorLabel";
import { date, format } from "@formkit/tempo";

export default function Personalizadas() {

    const { token, setLoading, centros, fetchCentros, pendientes, fetchPendientes, responsables, fetchResponsables} = useContext(AppContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [accion, setAccion] = useState(null); // create or update
    const [mostrarBotones, setMostrarBotones] = useState(true);

    useEffect(() => {
       
        fetchResponsables();
        fetchPendientes();
        fetchCentros();


        // console.log("Pendientes:", pendientes);
    }, []);

    useEffect(() => {
        setFormData({
            invoice_id: "",
            centre_id: "",
            concept: "",
            quantity: "",
            price: "",
            comments: "",
            internal_commentary: "",
            date: format(new Date(), "YYYY-MM-DD"),
        });
        setErrors({});
    }, [accion]);    

    const handleSubmit = async (e, saveForLater = false, is_budget = false) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await clienteAxios.post(
                `/api/invoices/create-custom`,
                {...formData, completed: !saveForLater, is_budget: is_budget},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: saveForLater ? "json" : "blob",
                }
            );

            if(!saveForLater){
                downloadBlobResponse(response, "Cotización.pdf");
            }

            toast.success("Cotización creada exitosamente");

            setErrors({});
            navigate("/cotizaciones");
        } catch (error) {
            console.log(error)
            if (error.response && error.response.data instanceof Blob) {
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
                            toast.error(
                                "Error desconocido al generar el PDF"
                            );
                        }
                    };
                    reader.readAsText(error.response.data);
                } else {
                    toast.error("Error desconocido al generar el PDF");
                }
            }
            else{
                setErrors(error.response.data.errors);
            }

        } finally {
            setLoading(false);
        }
    };

    const updateCotizacion = async (e, saveForLater = false) => {
        e.preventDefault();
        try {

            if(!formData.invoice_id) 
                return;

            const response = await clienteAxios.put(
                `/api/invoices/${formData.invoice_id}`,
                {
                    ...formData,
                    completed: !saveForLater,
                    total: formData.quantity * formData.price,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Cotización guardada como borrador");
            navigate("/cotizaciones");
        } catch (error) {
            setErrors(error.response.data.errors || {});
            toast.error("Error al guardar la cotización");
        }
    };

    return (
        <div className="max-w-200 mx-auto">
            <h2 className="title-2 mb-0">Cotizaciones personalizadas</h2>
            <p className="text text-muted mb-2">
                En esta sección, podrás realizar cotizaciones con conceptos y
                precios personalizados.
            </p>

            {mostrarBotones && <div className="flex gap-2 mb-4">
                <button
                    className="btn"
                    onClick={() => {
                        setMostrarBotones(false);
                        setAccion("create");
                    }}
                >
                    Crear nueva
                </button>
                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        setMostrarBotones(false);
                        setAccion("edit");
                    }}
                >
                    Terminar pendiente
                </button>
            </div>}

            {accion && (
                <form action="">
                    <div className={accion === "edit" ? "hidden" : ""}>
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
                            value={formData.centre_id || ""}
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
                        <ErrorLabel>{errors.centre_id}</ErrorLabel>

                        
                    </div>

                    <div className={accion === "create" ? "hidden" : ""}>
                        
                        <label className="label" htmlFor="invoice_id">
                            Cotización
                        </label>
                        <select
                            id="invoice_id"
                            className="input"
                            onChange={(e) => {
                                const selectedId = parseInt(e.target.value);
                                const selectedCot = pendientes.find(
                                    (cot) => cot.id === selectedId
                                );

                                if (selectedCot) {
                                    setFormData({
                                        ...formData,
                                        invoice_id: selectedCot.id,
                                        centre_id: selectedCot.centre.id,
                                        concept: selectedCot.concept,
                                        quantity: selectedCot.quantity,
                                        price: selectedCot.price,
                                        internal_commentary:
                                            selectedCot.internal_commentary,
                                        date: selectedCot.date,
                                        responsible_id: selectedCot.responsible_id,
                                    });
                                }
                            }}
                            value={formData.invoice_id || ""}
                        >
                            <option value="" disabled>
                                Selecciona una cotización
                            </option>
                            {pendientes.map((cot) => (
                                <option key={cot.id} value={cot.id}>
                                    {cot.concept} - {cot.centre.name}
                                </option>
                            ))}
                        </select>
                        <ErrorLabel>{errors?.invoice_id}</ErrorLabel>
                    </div>

                    <label className="label" htmlFor="centre_id">
                        Destinatario
                    </label>
                    <select
                        id="responsible_id"
                        className="input"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                responsible_id: e.target.value,
                            })
                        }
                        value={formData.responsible_id || ""}
                        disabled ={!formData.centre_id}
                    >
                        <option value="" disabled>
                            Seleccione un destinatario
                        </option>
                        {responsables
                            .filter((responsable) =>
                                centros.find(c=>c.id == formData.centre_id)?.responsibles?.some(r => r.id === responsable.id)
                            )
                            .map((responsable) => (
                            <option key={responsable.id} value={responsable.id}>
                                {responsable.name}
                            </option>
                        ))}
                    </select>
                    <ErrorLabel>{errors.responsible_id}</ErrorLabel>

                    <label className="label" htmlFor="fecha">
                        fecha
                    </label>
                    <input
                        className="input"
                        type="date"
                        id="fecha"
                        placeholder="fecha"
                        value={formData?.date}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                date: e.target.value,
                            })
                        }
                    />
                    <ErrorLabel>{errors?.date}</ErrorLabel>

                    <label className="label" htmlFor="concept">
                        Concepto
                    </label>
                    <textarea
                        className="input"
                        type="text"
                        id="concept"
                        placeholder="Concepto"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                concept: e.target.value,
                            })
                        }
                        value={formData.concept ?? ""}
                    >
                    </textarea>
                    
                    <ErrorLabel>{errors.concept}</ErrorLabel>

                    <label className="label" htmlFor="quantity">
                        Cantidad
                    </label>
                    <input
                        className="input"
                        type="number"
                        id="quantity"
                        placeholder="Cantidad"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                quantity: e.target.value,
                            })
                        }
                        value={formData.quantity ?? ""}
                    />
                    <ErrorLabel>{errors.quantity}</ErrorLabel>

                    <label className="label" htmlFor="price">
                        Precio
                    </label>
                    <input
                        className="input"
                        type="number"
                        id="price"
                        placeholder="Precio"
                        onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                        }
                        value={formData.price ?? ""}
                    />
                    <ErrorLabel>{errors.price}</ErrorLabel>

                    {/* <label htmlFor="comments" className="label">
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
                    ></textarea> */}

                    <label htmlFor="internal_commentary" className="label">
                        Comentarios internos
                    </label>
                    <textarea
                        value={formData.internal_commentary ?? ""}
                        id="internal_commentary"
                        placeholder="Comentarios internos"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                internal_commentary: e.target.value,
                            })
                        }
                    ></textarea>

                    <div className="contenedor-botones">
                        <button className="btn mt-4" onClick={handleSubmit}>
                            <Printer />
                            Generar
                        </button>

                        <button
                            className="btn mt-4 bg-green-700"
                            onClick={(e) =>
                                accion === "create"
                                    ? handleSubmit(e, true)
                                    : updateCotizacion(e, true)
                            }
                        >
                            <CalendarClock />
                            Guardar borrador
                        </button>

                        
                        <button className="btn btn-secondary mt-4" onClick={e=>handleSubmit(e, false, true)}>
                            <Printer />
                            Presupuesto
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
