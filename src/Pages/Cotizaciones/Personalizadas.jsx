
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
import get from 'lodash.get';
import { useParams } from "react-router-dom";
import { CotizacionesContext } from "@/context/CotizacionesContext";
import OtrosDatos from "./EditarComponents/OtrosDatos.jsx";
import SearchInput from "@/components/UI/SearchInput";
import Modal from "@/components/Modal";
import { formatearDinero } from "@/utils/utils";

export default function Personalizadas() {

    const { id } = useParams();

    const { cotizacion, fetchCotizacion, setCotizacion } = useContext(CotizacionesContext);
    const { token, setLoading, centros, fetchCentros, pendientes, fetchPendientes, responsables, fetchResponsables, fetchUnits, units, servicios, fetchServicios } = useContext(AppContext);

    const navigate = useNavigate();

    const {register, control, handleSubmit, watch, setValue } = useForm({
            defaultValues: {
            items: [{ concept: '', quantity: '', price: '', isListActive: false }]
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
    const [modalOpen, setModalOpen] = useState(false);
    const [precios, setPrecios] = useState([]);

    const items = watch('items');

    useEffect(() => {
        fetchResponsables();
        fetchPendientes();
        fetchCentros();
        fetchUnits();
        setCotizacion(null);
        fetchServicios();

        if(id){
            setAccion("edit");
            setMostrarBotones(false);
            fetchCotizacion(id); 
        }
    }, []);

    useEffect(()=>{
        // console.log(cotizacion);
        if(cotizacion){
            handleSelectCotizacion(null, cotizacion);

        }
    },[cotizacion]);

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

    const handleSelectCotizacion = (e = null, cotizacion = null) => {
    
        let selectedCot;

        if(!cotizacion){
            const selectedId = parseInt(e.target.value);
            selectedCot = pendientes.find(
                (cot) => cot.id === selectedId
            );
        }
        else{
            selectedCot = cotizacion;
        }

        if (selectedCot) {
            setFormData({
                ...formData,
                invoice_id: selectedCot.id,
                centre_id: selectedCot.centre.id,
                concept: selectedCot.concept,
                quantity: selectedCot.quantity,
                price: selectedCot.price,
                internal_commentary: selectedCot.internal_commentary,
                date: selectedCot.date,
                responsible_id: selectedCot.responsible_id,
                status: selectedCot.status,
                oc: selectedCot.oc,
                f_receipt: selectedCot.f_receipt,
                validation_date: selectedCot.validation_date,
            });

            removeAll();

            
            selectedCot.rows.forEach((row) =>{
                // console.log(row.sat_key_prod_serv);
                append({
                    concept: row.concept,
                    quantity: row.quantity,
                    price: row.price,
                    sat_unit_key: row.sat_unit_key,
                    sat_key_prod_serv: row.sat_key_prod_serv.trim(),
                });
            });
        }
    }

    const handleServiceSelect = (index) => (id, name) => {
        const servicio = servicios.find(s => s.id.toString() === id.toString());

        if (servicio) {
            setValue(`items.${index}.concept`, servicio?.name);
            setValue(`items.${index}.sat_unit_key`, servicio?.sat_unit_key);
            setValue(`items.${index}.sat_key_prod_serv`, servicio?.sat_key_prod_serv?.trim());
        }

        if(servicio?.prices?.length > 0){
            setPrecios(servicio.prices);
            console.log(servicio.prices);
            setModalOpen(true);
        }

        // setValue(`items.${index}.price`, servicio?.price);
    };

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
                `/api/invoices/custom`,
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
                // console.log(error.response.data);
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
                    <div className="border-1 border-neutral-400 p-2 rounded my-4">
                        <h3 className="title-3">Datos del documento</h3>
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
                                onChange={handleSelectCotizacion}
                                value={cotizacion?.centre?.id || formData.invoice_id || ""}
                                disabled ={cotizacion ? true : false}
                            >
                                <option value="" disabled>
                                    Selecciona una cotización
                                </option>
                                {pendientes.map((cot) => (
                                    <option key={cot.id} value={cot.id}>
                                        {cot.centre.name} ({format(new Date(cot.date), "DD/MM/YYYY")})
                                    </option>
                                ))}
                                {
                                    cotizacion && 
                                    <option key={cotizacion.centre.id} value={cotizacion.centre.id}>
                                        {cotizacion.centre.name} ({format(new Date(cotizacion.date), "DD/MM/YYYY")})
                                    </option>
                                }
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
                                
                                <div className="grid md:grid-cols-[1fr_4fr_2fr_1fr_2fr] gap-1 items-start">
                                    
                                    <div>
                                        <input
                                            {...register(`items.${index}.quantity`)}
                                            placeholder="Cantidad"
                                            className="input"
                                            type="number"
                                        />
                                        {/* <ErrorLabel>{errors?.['rows.0.quantity']}</ErrorLabel> */}
                                    </div>

                                    <div>
                                        {items[index]?.isListActive ?
                                            <SearchInput
                                                lista={servicios}
                                                error={errors.service_id}
                                                onSelectItem={handleServiceSelect(index)}  
                                                placeholder="Elige un servicio (opcional)"
                                                className="min-h-9 field-sizing-content"
                                                {...register(`items.${index}.concept`)}
                                            />
                                            :
                                            <input
                                                {...register(`items.${index}.concept`)}
                                                placeholder="Concepto"
                                                className="input"
                                                type="text"
                                            />
                                        }
                                        <ErrorLabel>{get(errors, `rows.${index}.concept`)}</ErrorLabel>

                                    </div>

                                    <div>
                                        <input
                                            {...register(`items.${index}.price`)}
                                            placeholder="Precio"
                                            className="input"
                                            type="number"
                                        />
                                        <ErrorLabel>{get(errors, `rows.${index}.price`)}</ErrorLabel>
                                    </div>

                                    <div>
                                        <select 
                                            id="sat_unit_key"
                                            defaultValue=""
                                            {...register(`items.${index}.sat_unit_key`)}
                                        >
                                            {/* <option value="" disabled>Unidad de medida</option> */}
                                                {units.map((unit) => (
                                                    <option
                                                        key={unit.key}
                                                        value={unit.key}
                                                    >
                                                        {unit.name} ({unit.key})
                                                    </option>
                                                ))}
                                        </select>
                                        <ErrorLabel>{get(errors, `rows.${index}.sat_unit_key`)}</ErrorLabel>
                                    </div>
                                    
                                    <div>
                                        <input
                                            {...register(`items.${index}.sat_key_prod_serv`)}
                                            placeholder="Clave de producto o servicio"
                                            className="input"
                                            type="number"
                                        />
                                        <ErrorLabel>{get(errors, `rows.${index}.sat_key_prod_serv`)}</ErrorLabel>
                                    </div>

                                </div>
                                
                                <div className="contenedor-botones">
                                    <button className="link block" type="button" onClick={() => {
                                        setValue(`items.${index}.isListActive`, !items[index]?.isListActive);
                                    }}>
                                        {items[index]?.isListActive ? 'Ocultar' : 'Ver'} lista de servicios
                                    </button>
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
                    </div>

                    { 
                        // Solo en caso de que se esté editando
                        cotizacion &&
                        <div className="border-1 border-neutral-400 p-2 rounded my-4">
                            <OtrosDatos
                                formData={formData}
                                setFormData={setFormData}
                                errors={errors}
                                cotizacion={cotizacion}
                            />
                        </div>
                    }


                    <div className="contenedor-botones">
                            <button 
                                className="btn" 
                                type="submit"
                                onClick={()=> setCompleted(true)}
                            >
                                <Printer />
                                Generar
                            </button>

                            {
                                    
                                // Si hay cotización, es porque se está editando
                                !cotizacion && <>
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
                                </>
                            }
                        </div>
                </form>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            >
                <h2 className="title-3">Selecciona un precio</h2>

                <table className="text border dark:border-neutral-600">
                    <tbody>
                        {precios.map((precio, index) => (
                            <tr key={index} className="" >
                                <td className="border dark:border-neutral-600 p-2">$ {formatearDinero(precio.price)}</td>
                                <td className="border dark:border-neutral-600 p-2">{precio.vehicle_type.type}</td>
                                <td className="border dark:border-neutral-600 p-2">
                                    <button
                                        key={index}
                                        className="btn"
                                        onClick={() => {
                                            setValue(`items.${items.findIndex(item => item.isListActive)}.price`, precio.price);
                                            setModalOpen(false);
                                        }}
                                    >
                                        Seleccionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </Modal>
        </div>
    );
}
