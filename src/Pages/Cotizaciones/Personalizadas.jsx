
import { useEffect, useState } from "react";
import { CalendarClock, Printer } from "lucide-react";
import { downloadBlobResponse } from "@/utils/downloadFile"; 
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import clienteAxios from "@/config/axios";
import { toast } from "react-toastify";
import { ca } from "react-day-picker/locale";

export default function Personalizadas() {

    const { token, setLoading, centros, fetchCentros, pendientes, fetchPendientes} = useContext(AppContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [accion, setAccion] = useState(null); // create or update

    useEffect(() => {
        
        fetchPendientes();
        fetchCentros();


        console.log("Pendientes:", pendientes);
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
        });
        setErrors({});
    }, [accion]);    

    const handleSubmit = async (e, saveForLater = false) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await clienteAxios.post(
                `/api/invoices/create-custom`,
                {...formData, completed: !saveForLater},
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
        }
    };

    return (
        <div className="max-w-200 mx-auto">
            <h2 className="title-2 mb-0">Cotizaciones personalizadas</h2>
            <p className="text text-muted mb-2">
                En esta sección, podrás realizar cotizaciones con conceptos y
                precios personalizados.
            </p>

            <div className="flex gap-2 mb-4">
                <button
                    className="btn"
                    onClick={() => {
                        setAccion("create");
                    }}
                >
                    Crear nueva
                </button>
                <button
                    className="btn"
                    onClick={() => {
                        setAccion("edit");
                    }}
                >
                    Terminar pendiente
                </button>
            </div>

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
                        {errors.centre_id && (
                            <p className="text-red-500">
                                {errors.centre_id[0]}
                            </p>
                        )}
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
                                        internal_commentary: selectedCot.internal_commentary,
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
                        {errors.invoice_id && (
                            <p className="text-red-500">
                                {errors.invoice_id[0]}
                            </p>
                        )}
                    </div>

                    <label className="label" htmlFor="concept">
                        Concepto
                    </label>
                    <input
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
                    />
                    {errors.concept && (
                        <p className="text-red-500">{errors.concept[0]}</p>
                    )}

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
                    {errors.quantity && (
                        <p className="text-red-500">{errors.quantity[0]}</p>
                    )}

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
                    {errors.price && (
                        <p className="text-red-500">{errors.price[0]}</p>
                    )}

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

                    <div className="flex gap-2">
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
                    </div>
                </form>
            )}
        </div>
    );
}
