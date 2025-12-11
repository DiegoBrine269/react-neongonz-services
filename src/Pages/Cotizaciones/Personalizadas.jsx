
import { useEffect, useState } from "react";
import { CalendarClock, Printer, Trash2, ListPlus } from "lucide-react";
import { downloadBlobResponse } from "@/utils/downloadFile"; 
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import clienteAxios from "@/config/axios";
import { toast } from "react-toastify";
import ErrorLabel from "@/components/UI/ErrorLabel";
import { date, format } from "@formkit/tempo";
import FilaCotizacion from './FilaCotizacion';
import 'animate.css';
import { useForm, useFieldArray } from 'react-hook-form';
import Swal from "sweetalert2";
import { swalConfig } from "@/config/variables";

export default function Personalizadas() {

    const { token, setLoading, centros, fetchCentros, pendientes, fetchPendientes, responsables, fetchResponsables} = useContext(AppContext);

    const navigate = useNavigate();

    const {register, control, handleSubmit } = useForm({
            defaultValues: {
            items: [{ concept: '', quantity: '', price: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const removeAll = () => {
        remove(fields.map((_, index) => index));
    }

    const [formData, setFormData] = useState({});
    const [completed, setCompleted] = useState(false);
    const [isBudget, setIsBudget] = useState(false);
    const [errors, setErrors] = useState({});
    const [accion, setAccion] = useState(null); // create or update
    const [mostrarBotones, setMostrarBotones] = useState(true);

    useEffect(() => {
        fetchResponsables();
        fetchPendientes();
        fetchCentros();
    }, []);

    useEffect(() => {
        setFormData({
            invoice_id: "",
            centre_id: "",
            comments: "",
            internal_commentary: "",
            date: format(new Date(), "YYYY-MM-DD"),
        });
        setErrors({});
    }, [accion]);    

    const handleClickEliminar = async () => {
        const result = await Swal.fire({
            title: "¿Estás segur@ de querer eliminar la cotización?",
            text: "Esta acción es irreversible",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar cotización",
            cancelButtonText: "Cancelar",
            ...swalConfig(true),
        });

        if (result.isConfirmed) {
            setLoading(true);

            try {
                setLoading(true);
                const res = await clienteAxios.delete(`/api/invoices/${formData.invoice_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Cotización eliminada correctamente");
                fetchPendientes();
                setFormData({});
                removeAll();
                
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error al eliminar la cotización");
            } finally {
                setLoading(false);
            }
        }
    
    }

    const onSubmit = async (data) => {
        setLoading(true);

        const payload = {
            ...formData,
            rows: data.items,
            completed: completed,
            is_budget: isBudget,
        };

        try {
            const response = await clienteAxios.post(
                `/api/invoices/create-custom`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: !completed ? "json" : "blob",
                }
            );

            if(completed){
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
                    Ver pendientes
                </button>
            </div>}

            {accion && (
                <form action="" onSubmit={handleSubmit(onSubmit)}>
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

                                    removeAll();

                                    selectedCot.rows.forEach((row) =>{
                                        append({
                                            concept: row.concept,
                                            quantity: row.quantity,
                                            price: row.price,
                                        });
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

                    {fields.map((field, index) => (
                        <div key={field.id} className="my-3 relative border p-2 rounded-lg border-neutral-400">
                            
                            <div className="flex justify-between mb-1 center-items">
                                <p className="text ">Fila {index+1}</p>
                                <button className="btn btn-danger !w-auto !p-1 m-0" type="button" onClick={() => remove(index)}>
                                    <Trash2
                                        className="h-4 w-4"
                                    />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-[1fr_4fr_2fr] gap-1">
                                <input
                                    {...register(`items.${index}.quantity`)}
                                    placeholder="Cantidad"
                                    className="input"
                                    type="number"
                                />
                                <input
                                    {...register(`items.${index}.concept`)}
                                    placeholder="Concepto"
                                    className="input"
                                />
                                <input
                                    {...register(`items.${index}.price`)}
                                    placeholder="Precio"
                                    className="input"
                                    type="number"
                                />
                            </div>

                        </div>
                    ))}

                    <div className="flex justify-end mt-2">
                        <button className="w-auto btn" type="button" onClick={() => append({ concept: '', quantity: '', price: '' })}>
                            <ListPlus/>
                            Agregar fila
                        </button>
                    </div>

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
                        <button 
                            className="btn" 
                            type="submit"
                            onClick={()=> setCompleted(true)}
                        >
                            <Printer />
                            Generar
                        </button>

                        <button
                            className="btn bg-green-700"
                            type="submit"
                            onClick={()=> setCompleted(false)}
                        >
                            <CalendarClock />
                            Borrador
                        </button>

                        <button 
                            className="btn btn-secondary" 
                            type="submit"
                            onClick={() => {
                                setIsBudget(true);
                                setCompleted(true);
                            }}
                        >
                            <Printer />
                            Presupuesto
                        </button>

                        {formData.invoice_id && <button 
                            className="btn btn-danger" 
                            type="button"
                            onClick={handleClickEliminar}
                        >
                            <Trash2 />
                            Eliminar
                        </button>}
                    </div>
                </form>
            )}
        </div>
    );
}
