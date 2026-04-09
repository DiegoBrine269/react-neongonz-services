
import { CirclePlus, UserRoundPen, Trash2, CircleCheck, Receipt, Pencil, MailIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Tabla from "../../components/Tabla";
import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Modal from "../../components/Modal";
import clienteAxios from "../../config/axios";
import { formatoMoneda, swalConfig } from "../../config/variables";
import Swal from "sweetalert2";
import { format } from "@formkit/tempo";
import { motion, AnimatePresence } from "framer-motion";
import ErrorLabel from '@/components/UI/ErrorLabel';
import { useForm, useFieldArray } from 'react-hook-form';
import get from 'lodash.get';
import ButtonSubmit from "@/components/UI/Buttons/ButtonSubmit";
import FacturacionPreview from "@/Pages/Cotizaciones/FacturacionPreview";
import ComplementoPreview from "@/Pages/Cotizaciones/ComplementoPreview";

import ReactDOMServer from "react-dom/server";
import { columnasCotizaciones } from "./configCotizaciones";

const MotionButton = motion.create(ButtonSubmit);

export default function Cotizaciones() {


    const [cotizacion, setCotizacion] = useState({});

    const [selectedRows, setSelectedRows] = useState([]);
    const [listaComplementos, setListaComplementos] = useState([]);

    
    const [modal, setModal] = useState(false);
    const [modal2, setModal2] = useState(false);
    const [modal3, setModal3] = useState(false);


    const [formData, setFormData] = useState({
        validation_date: format(new Date(), "YYYY-MM-DD"),
    });
    
    const [errors, setErrors] = useState({});

    // React Hook Form setup
    const {register, handleSubmit, setValue } = useForm({
            defaultValues: {
            items: [] 
        }
    });

    const [activeTab, setActiveTab] = useState('todas');
    const tabs = [
        { id: 'todas', label: 'Todas' },
        { id: 'envio', label: 'Para envío'},
        { id: 'oc', label: 'Para OC' },
        { id: 'factura', label: 'Para factura' },
        { id: 'f', label: 'Para F' },
        { id: 'complemento', label: 'Para complemento' },
        { id: 'finalizada', label: 'Finalizadas' },

    ];


    const { tableRef, token, setLoading, pendientes, fetchPendientes,  pendientesEnvio, fetchPendientesEnvio, requestHeader, fetchCustomers, customers } = useContext(AppContext);

    const [reloadKey, setReloadKey] = useState(0);
    const savedFiltersRef = useRef([]);

    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
    };


    const recargarTabla = () => {
        tableRef.current.replaceData();
    };

    const handleClickComplemento = () => {
        // const grouped = Object.values(
        //     selectedRows.reduce((acc, item) => {
        //         const id = item.billing.id;
        //         const uuid = item.billing.uuid;

        //         if (!acc[id]) {
        //             acc[id] = {
        //                 id: id,
        //                 uuid: uuid,
        //                 total: 0,
        //             };
        //         }
                
        //         acc[id].total += parseInt(item.total)*1.16;

        //         return acc;
        //     }, {})
        // );

        // console.log(grouped)
        // setListaComplementos(grouped);

        const ocs = new Set(selectedRows.map(r => r.oc));

        const params = new URLSearchParams();

        Array.from(ocs).forEach((oc, i) => {
            params.append(`filter[${i}][field]`, 'oc');
            params.append(`filter[${i}][type]`, '=');
            params.append(`filter[${i}][value]`, oc);
        });

        clienteAxios.get(`/api/invoices?${params.toString()}`, requestHeader)
            .then(res => {
                const grouped = Object.values(
                    res.data.data.reduce((acc, item) => {
                        const id = item.billing?.id || `no-billing-${item.id}`;
                        const uuid = item.billing?.uuid || null;

                        if (!acc[id]) {
                            acc[id] = {
                                id: id,
                                uuid: uuid,
                                total: 0,
                            };
                        }
                        
                        acc[id].total += parseInt(item.total)*1.16;

                        return acc;
                    }, {})
                );

                setListaComplementos(grouped);  
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                toast.error("Error al cargar los datos para los complementos");
            }); 
            

        
        setModal3(true)
    }

    const handleRowClick = useCallback((e, row) => {
        const data = row?.getData?.();
        setCotizacion(data);
        setFormData(prev => ({
            ...prev,
            validation_date: format(new Date(), "YYYY-MM-DD")
        }));
        setModal(true);
    }, []);


    const handleRowSelectionChanged = useCallback((selectedData) => {
        setSelectedRows(selectedData);
    }, []);

    useEffect(() => {
        // cuando la tabla se “reconstruye”, vuelves a aplicar
        if (tableRef.current && savedFiltersRef.current?.length) {
            tableRef.current.setFilter(savedFiltersRef.current);
        }
    }, [reloadKey]);

    //Esto es para enviar los ids de las facturas seleccionadas al formulario de complemento dinámicamente
    useEffect(() => {
        setValue(
            "items",
            listaComplementos.map(row => ({
            id: row.id,
            amount: ""
            }))
        );
    }, [listaComplementos]);

    async function fetchInvoiceFile() {
        try {
            setLoading(true);
            const res = await clienteAxios.get(`/api/invoices/${cotizacion?.id}/pdf`, requestHeader);

            const pdfUrl = res.data.url;
            console.log(pdfUrl);

            window.open(pdfUrl, "_blank");



        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al descargar el PDF");
        }
        finally {
            setLoading(false);
        }
    }

    async function fetchZipFile(id) {
        try {
            setLoading(true);
            const response = await clienteAxios.get(`/api/billings/${id}`, {
                responseType: "blob",
                ...requestHeader
            });

            const disposition = response.headers["content-disposition"] || "";
            const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
            const fileName = decodeURIComponent(match?.[1] || match?.[2] || `SAT.zip`);

            const blob = new Blob([response.data], {
                type: "application/zip",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al descargar los archivos");
        }
        finally {
            setLoading(false);
        }
    }


    async function handleEliminarCotizaciones() {

        const result = await Swal.fire({
            title: "¿Estás segur@ de querer eliminar la(s) cotización(es)?",
            text: "Esta acción es irreversible",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            ...swalConfig(true),
        });

        if (result.isConfirmed) {

            try {
                setLoading(true);
                const res = await clienteAxios.delete('/api/invoices',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                          data: {
                            ids: selectedRows.map(r => r.id), // 👈 aquí mandas los IDs
                        },
                    }
                );

                toast.success("Cotizaciones eliminadas correctamente");
                recargarTabla();

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error al eliminar las cotizaciones");
            } finally {
                setLoading(false);
                setSelectedRows([]);
            }
        }
    }

    async function handleEnviarCotizaciones() {
        const result = await Swal.fire({
            title: "¿Estás segur@ de querer enviar la(s) cotización(es)?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, enviar",
            cancelButtonText: "Cancelar",
            ...swalConfig(true),
        });

        if (result.isConfirmed) {

            try {
                setLoading(true);
                const res = await clienteAxios.post(`/api/invoices/send`, {
                                    invoice_ids: selectedRows.map(r => r.id), 
                                }, 
                                requestHeader
                            );
                
                toast.success(res.data.message || "Cotizaciones enviadas correctamente");
                recargarTabla();

            } catch (error) {
                toast.error("Error al enviar las cotizaciones");
            } finally {
                setLoading(false);
                setSelectedRows([]);
            }
        }
    
    }

    async function handleEliminarCotizacion() {

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
                const res = await clienteAxios.delete(`/api/invoices/${cotizacion?.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Cotización eliminada correctamente");
                setModal(false);
                setCotizacion({});

                recargarTabla();

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error al eliminar la cotización");
            } finally {
                setLoading(false);
            }
        }
    }

    async function handleUpdateStatus() {

        try {
            setLoading(true);
            await clienteAxios.put(`/api/invoices/${cotizacion.id}/update-status`, formData, requestHeader);
            setFormData({});
            setModal(false);
            toast.success("Cotización actualizada correctamente");
            recargarTabla();

        } catch (error) {
            toast.error("Error al actualizar la cotización");

            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleFacturar = async () => {
        try {
            // 1. Primero valida sin ejecutar
            setLoading(true);
            try {
                await clienteAxios.post(
                    `/api/billings/sat-billing`,
                    {
                        invoice_ids: selectedRows.map(r => r.id),
                        ...formData,
                        dry_run: true, 
                    },
                    requestHeader
                );
            } catch (error) {
                console.log(error.response.data.error)
                setErrors(error.response?.data?.errors || error.response?.data?.error || {});
                setLoading(false);
                return; 
            }
            setLoading(false);

            // 2. Sin errores → confirmar
            const result = await Swal.fire({
                title: "¿Estás segur@ de querer emitir la(s) factura(s)?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, emitir",
                cancelButtonText: "Cancelar",
                ...swalConfig(true),
                html: ReactDOMServer.renderToString(
                    <FacturacionPreview data={{ cotizaciones: selectedRows, formData }} />
                ),
            });

            if (!result.isConfirmed) return;

            // 3. POST real
            setErrors({});
            setLoading(true);
            const res = await clienteAxios.post(
                `/api/billings/sat-billing`,
                {
                    invoice_ids: selectedRows.map(r => r.id),
                    ...formData,
                },
                requestHeader
            );

            toast.success(res.data.message || "Factura(s) emitida(s) correctamente");
            setModal2(false);
            setCotizacion({});
            recargarTabla();
        }   
        catch (error) { 

            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
                return;
            }
            
            Swal.fire({
                title: "Error al emitir la(s) factura(s)",
                text: error.response.data.error ?? "Asegúrate de haber llenado los campos de Clave de producto y Clave unidad SAT.",
                icon: "error",
                ...swalConfig(),
            });

        } finally {
            setLoading(false);
        }
    }

    const handleComplemento = async (data) => {
        try {
            setLoading(true);

            try {
                await clienteAxios.post(`/api/billings/sat-complement`,
                    {
                        data: data.items,
                        ...formData,
                        dry_run: true,
                    },
                    requestHeader
                );
            } catch (error) {
                setErrors(error.response?.data?.errors || {});
                return;
            } finally {
                setLoading(false);
            }

            const result = await Swal.fire({
                title: "¿Estás segur@ de querer emitir el/los complemento(s)?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, emitir",
                cancelButtonText: "Cancelar",
                ...swalConfig(true),
                html: ReactDOMServer.renderToString(
                    <ComplementoPreview data={{ cotizaciones: selectedRows, formData }} />
                ),
            });

            if (!result.isConfirmed) return;

            setErrors({});
            setLoading(true);

            const res = await clienteAxios.post(`/api/billings/sat-complement`,
                {
                    data: data.items,
                    ...formData,
                },
                requestHeader
            );

            toast.success(res.data.message || "Complemento(s) emitido(s) correctamente");
            setModal(false);
            setCotizacion({});
            recargarTabla();
            setModal3(false);
        } catch (error) {
            if (error.response?.data?.errors)
                setErrors(error.response.data.errors);

            console.error("Error fetching data:", error);
            toast.error("Error al emitir el/los complemento(s)");
        } finally {
            setLoading(false);
        }
    }
  
    useEffect(() => {
        //Cotizaciones pendientes de terminar
        fetchPendientes();

        //Pendientes de enviar
        fetchPendientesEnvio();

        fetchCustomers();
    }, []);

    useEffect(()=>{
        if(formData.payment_method === 'PPD' && activeTab === 'factura'){
            setFormData(prevFormData => ({...prevFormData, payment_form: '99'}));
        }

        if(formData.payment_form === '99' && formData.payment_method === 'PUE' && activeTab === 'factura'){
            setFormData(prevFormData => ({...prevFormData, payment_form: ''}));
        }

        // if(activeTab === 'factura')
        //     setFormData({...formData, joined: 1});
    }, [formData.payment_method, formData.payment_form, activeTab]);

    return (
        <>
            <h2 className="title-2">Cotizaciones</h2>

            <div className="contenedor-botones">
                <AnimatePresence mode="wait">

                
                    {
                        selectedRows.length > 0 ?
                            
                            <motion.div
                                key="acciones"
                                className="contenedor-botones"
                                {...motionProps}
                            >
                                { activeTab !== 'factura' && activeTab !== 'f' && activeTab != 'complemento' && <motion.button

                                    className="btn btn-danger"
                                    onClick={handleEliminarCotizaciones}
                                    {...motionProps}
                                >
                                    <Trash2 />
                                    Eliminar
                                </motion.button>}

                                {
                                    (activeTab == 'envio' || activeTab == 'oc') &&
                                    <MotionButton
                                        onClick={handleEnviarCotizaciones}
                                        icon={<MailIcon />}
                                        {...motionProps}
                                    >
                                        Enviar
                                    </MotionButton>
                                }

                                {
                                    activeTab == 'factura' &&
                                    <motion.button
                                        className="btn"
                                        onClick={() => {
                                            //Verificar que todas las filas sean de cotizaciones del mismo CV
                                            const multipleCentres = new Set(selectedRows.map(r => r.centre_id)).size > 1;
                                            if(multipleCentres){
                                                Swal.fire({
                                                    title: "Selecciona cotizaciones del mismo Centro de Ventas",
                                                    text: "Solo puedes facturar de manera múltiple a un mismo Centro de Ventas a la vez.",
                                                    icon: "error",
                                                    ...swalConfig(),
                                                });
                                                setLoading(false);
                                                return;
                                            }
                                            setModal2(true)
                                            setErrors({})
                                            setFormData({...formData, joined:1});
                                        }}
                                        {...motionProps}
                                    > 
                                            <>
                                                <MailIcon />
                                                Facturar y enviar
                                            </>
                                        
                                    </motion.button>
                                }
                                {
                                    activeTab == 'complemento' &&
                                    <motion.button
                                        className="btn"
                                        onClick={handleClickComplemento}
                                        
                                        {...motionProps}
                                    > 
                                            <>
                                                <Receipt />
                                                Emitir complemento
                                            </>
                                        
                                    </motion.button>
                                }
                            </motion.div>
                            
                        :
                            <motion.div
                                key="acciones"
                                className="contenedor-botones"
                                {...motionProps}
                            >
                                <Link className="btn" to="/cotizaciones/nueva">
                                    <CirclePlus />
                                    Crear ordinaria
                                </Link>

                                <Link
                                    className="btn btn-secondary relative"
                                    to="/cotizaciones/personalizadas"
                                >
                                    <UserRoundPen/>
                                    Personalizadas{" "}
                                    <span className="counter">{pendientes?.length}</span>
                                </Link>
                            </motion.div>
                    }
                </AnimatePresence>
            </div>

            <div>

                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {

                                setActiveTab(tab.id)
                                const filter = ["status", "=", tab.id === 'todas' ? "" : tab.id];
                                tableRef.current.setFilter(...filter);
                            }}
                            className={activeTab === tab.id || tab.active ? 'tab active' : 'tab'}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Tabla
                    key={reloadKey}
                    className="custom-table"
                    columns={columnasCotizaciones}
                    ref={tableRef}
                    layout="fitColumns"
                    options={{
                        // selectable: true,
                        pagination: true, //enable pagination
                        paginationMode: "remote", //enable remote pagination
                        ajaxURL: `${import.meta.env.VITE_API_URL}/api/invoices`,
                        ajaxConfig: {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                        filterMode: "remote",
                    }}
                    onRowClick={handleRowClick}
                    onSelectionChange={handleRowSelectionChanged}
                />
            </div>

            <Modal isOpen={modal} onClose={() => setModal(false)}>
                <h2 className="title-3">{cotizacion?.invoice_number}</h2>
                <div className="flex flex-col gap-3 pl-2">

                    {
                        activeTab === 'oc' &&
                        <div className="text">
                            <span className="label-modal">
                                Número de Orden de Compra
                            </span>{" "}
                            <div className="flex gap-1 mt-1 items-center">
                                <input 
                                    type="text" 
                                    className="input"
                                    placeholder="Ingresa el número de Orden de Compra" 
                                    value={formData.oc || ''}
                                    onChange={e => setFormData({...formData, oc: e.target.value})}
                                    autoFocus
                                />
                                <button 
                                    className="btn w-11 h-9"
                                    onClick={handleUpdateStatus}
                                    >
                                    <CircleCheck />
                                </button>
                            </div>
                            <ErrorLabel>{errors?.oc}</ErrorLabel>
                        </div>
                    }

                    {
                        activeTab === 'f' &&
                        <>
                            <div className="text">
                                <span className="label-modal">
                                    Número de recibo (F)
                                </span>{" "}
                                <div className="mt-2">
                                    <input 
                                        type="text" 
                                        className="input"
                                        placeholder="Ingresa el número de recibo (F)" 
                                        value={formData.f_receipt || ''}
                                        onChange={e => setFormData({...formData, f_receipt: e.target.value})}
                                        autoFocus
                                    />
                                    <ErrorLabel>{errors?.f_receipt}</ErrorLabel>
                                </div>
                            </div>

                            <div className="text">
                                <span className="label-modal">
                                    Fecha de validación
                                </span>{" "}
                                <div className="mt-2">
                                    <input 
                                        type="date" 
                                        className="input"
                                        placeholder="Fecha de validación" 
                                        value={formData.validation_date || ''}
                                        onChange={e => setFormData({...formData, validation_date: e.target.value})}
                                    />
                                    <ErrorLabel>{errors?.validation_date}</ErrorLabel>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    className="btn w-11 h-9"
                                    onClick={handleUpdateStatus}
                                >
                                    <CircleCheck />
                                </button>
                            </div>
                        </>
                    }

                    <div className="text">
                        <span className="label-modal">
                            Centro de ventas
                        </span>{" "}
                        <p>{cotizacion?.centre}</p>
                    </div>

                    <div className="text">
                        <span className="label-modal">
                            Fecha de cotización
                        </span>{" "}
                        <p>{format(cotizacion?.date, "DD/MM/YYYY")}</p>
                    </div>

                    { cotizacion?.billing && 
                    <div className="text">
                        <span className="label-modal">
                            Fecha de facturación
                        </span>{" "}
                        <p>{format(cotizacion?.billing.date, "DD/MM/YYYY")}</p>
                    </div>}

                    {cotizacion?.validation_date && (
                        <div className="text">
                            <span className="label-modal">
                                Fecha de validación
                            </span>{" "}
                            <p>{format(cotizacion?.validation_date, "DD/MM/YYYY")}</p>
                        </div>
                    )}

                    {cotizacion?.services && (
                        <div className="text">
                            <span className="label-modal">
                                Servicios
                            </span>{" "}
                            <p>{cotizacion?.services}</p>
                        </div>
                    )}

                    {
                        cotizacion?.oc &&
                        <div className="text">
                            <span className="label-modal">
                                No. de orden de compra
                            </span>{" "}
                            <p>{cotizacion?.oc}</p>
                        </div>
                    }

                    {
                        cotizacion?.uuid &&
                        <div className="text">
                            <span className="label-modal">
                                Folio fiscal
                            </span>{" "}
                            <p>{cotizacion?.uuid}</p>
                        </div>
                    }

                    {
                        cotizacion?.f_receipt &&
                        <div className="text">
                            <span className="label-modal">
                                Número de F
                            </span>{" "}
                            <p>{cotizacion?.f_receipt}</p>
                        </div>
                    }

                    <div className="text">
                        <span className="label-modal">
                            Monto total
                        </span>{" "}
                        <p>{formatoMoneda.format(cotizacion?.total)}</p>
                    </div>

                    <div className="text">
                        <span className="label-modal">
                            Archivo de cotización
                        </span>{" "}
                        <button
                            className="underline cursor-pointer py-1"
                            onClick={fetchInvoiceFile}
                        >
                            Ver pdf 📄
                        </button>
                    </div>

                    {
                        cotizacion?.billing?.pdf_path &&
                        <div className="text">
                            <span className="label-modal">
                                Factura
                            </span>{" "}
                            <button
                                className="underline cursor-pointer py-1"
                                onClick={()=>fetchZipFile(cotizacion.billing.id)}
                            >
                                Descargar archivos 📄
                            </button>
                        </div>
                    }

                    {
                        cotizacion?.complements?.map(
                            (complement, index) =>
                                <div className="text" key={index}>
                                    <span className="label-modal">
                                        Complemento {index + 1} 
                                    </span>{" "}
                                    <button
                                        className="underline cursor-pointer py-1"
                                        onClick={()=>fetchZipFile(complement.id)}

                                    >
                                        Descargar archivos 📄
                                    </button>
                                </div>
                        )
                    }


                    {cotizacion?.internal_commentary && (
                        <div className="text">
                            <span className="label-modal">
                                Comentarios internos
                            </span>{" "}
                            <p>{cotizacion?.internal_commentary}</p>
                        </div>
                    )}


                    <div className="flex justify-end gap-2 w-full">
                        <button
                            className="btn btn-danger"
                            onClick={handleEliminarCotizacion}
                        >
                            <Trash2 />
                            Eliminar
                        </button>
                        {
                            (cotizacion.status === 'envio' || cotizacion.status === 'oc') && 
                            
                            <>
                                {!cotizacion.is_custom ? 
                                    <Link
                                        className="btn btn-secondary"
                                        to={`/cotizaciones/editar/${cotizacion?.id}`}
                                    >
                                        <Pencil />
                                        Editar
                                    </Link>
                                :
                                    <Link
                                        className="btn btn-secondary"
                                        to={`/cotizaciones/personalizadas/${cotizacion?.id}`}
                                    >
                                        <Pencil />
                                        Editar
                                    </Link>}
                            </>
                        }

                    </div>
                </div>
            </Modal>

            <Modal isOpen={modal2} onClose={() => setModal2(false)}>
                <h2 className="title-3">Ingresa los siguientes datos</h2>
                <div className="">

                        <label className="label" htmlFor="payment_form">Forma de pago:</label>
                        <select  
                            id="payment_form"
                            defaultValue=""
                            value={formData.payment_form || ''}
                            onChange={e => setFormData({...formData, payment_form: e.target.value})}
                            disabled={formData.payment_method === 'PPD'}
                            autoFocus
                        >
                            <option value="" disabled>Selecciona una opción</option>
                            <option value="01">Efectivo</option>
                            <option value="03">Transferencia electrónica de fondos</option>
                            <option value="99">Por definir</option>
                        </select>
                        <ErrorLabel>{errors.payment_form}</ErrorLabel>

                        <label className="label" htmlFor="payment_method">Método de pago:</label>
                        <select 
                            id="payment_method"
                            defaultValue=""
                            value={formData.payment_method || ''}
                            onChange={e => setFormData({...formData, payment_method: e.target.value})}
                        >
                            <option value="">Selecciona una opción</option>
                            <option value="PUE">(PUE) Pago en una sola exhibición</option>
                            <option value="PPD">(PPD) Pago en parcialidades o diferido</option>
                        </select>
                        <ErrorLabel>{errors.payment_method}</ErrorLabel>

                       {selectedRows.length > 1 && (
                        <>
                            <label className="label">Forma de facturar</label>
                            <div className="pl-2">
                                <label 
                                    htmlFor="joined" 
                                    className="text text-sm flex gap-1 mt-0"
                                    onClick={() => setFormData({...formData, joined: 1})}
                                >
                                    <input type="radio" name="joined" id="joined" value={1} defaultChecked />
                                    <span className="bre">Facturar de manera conjunta (una factura por todas las cotizaciones)</span>
                                </label>
    
                                <label 
                                    htmlFor="not-joined" 
                                    className="text text-sm flex gap-1 mt-0"
                                    onClick={() => setFormData({...formData, joined: 0})}
                                >
                                    <input type="radio" name="joined" id="not-joined" value={0} />
                                    <span className="bre">Facturar de manera individual (una factura por cada cotización)</span>
                                </label>
                            </div>
                            <ErrorLabel>{errors.joined}</ErrorLabel>
                       </>) }

                        <ErrorLabel>{errors.product_key}</ErrorLabel>
                        <ErrorLabel>{errors.sat_unit_key}</ErrorLabel>
                        <ErrorLabel>{errors.customer}</ErrorLabel>
                        <ErrorLabel>{errors.error}</ErrorLabel>
                        



                        <div className="contenedor-botones">
                            <ButtonSubmit
                                onClick={handleFacturar}
                                icon={<CircleCheck />}
                            >
                                Aceptar
                            </ButtonSubmit>
                        </div>
                </div>
            </Modal>

            {/* Modal para pedir datos de complemento */}
            <Modal isOpen={modal3} onClose={() => setModal3(false)}>
                <h2 className="title-3">Ingresa los siguientes datos</h2>
                <form className="" onSubmit={handleSubmit(handleComplemento)}>
                    <label className="label" htmlFor="payment_form">Forma de pago:</label>
                    <select  
                        id="payment_form"
                        defaultValue=""
                        value={formData.payment_form}
                        onChange={e => setFormData({...formData, payment_form: e.target.value})}
                        autoFocus
                    >
                        <option value="">Selecciona una opción</option>
                        <option value="01">Efectivo</option>
                        <option value="03">Transferencia electrónica de fondos</option>
                    </select>
                    <ErrorLabel>{errors.payment_form}</ErrorLabel>


                    <label className="label" htmlFor="payment_date">Fecha de pago</label>
                    <input 
                        type="date" 
                        className="input"
                        id="payment_date"
                        onChange={e => setFormData({...formData, payment_date: e.target.value})}
                     />
                    <ErrorLabel>{errors.payment_date}</ErrorLabel>

                    <label className="label" htmlFor="customer">Cliente fiscal</label>
                    <select  
                        id="customer"
                        defaultValue=""
                        // value={formData.payment_form || ''}
                        onChange={e => setFormData({...formData, customer_id: e.target.value})}
                    >
                        <option value="" disabled>Selecciona una opción</option>
                        {
                            customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.legal_name}</option>
                            ))
                        }
                    </select>
                    <ErrorLabel>{errors.customer_id}</ErrorLabel>
                    {
                        listaComplementos.map((row, index) =>(
                            <>
                                <label className="label" htmlFor={row.id}>Importe de pago de {row.uuid.substring(0,8) + '...'} ({formatoMoneda.format(row.total)})</label>
                                <input
                                    {...register(`items.${index}.amount`)}
                                    id={row.id}
                                    type="number" 
                                    className="input" 
                                    placeholder="Importe de pago"
                                    min="1"
                                />
                                <ErrorLabel>{get(errors, `data.${index}.amount`)}</ErrorLabel>
                            </>
                        ))
                    }

                    <div className="contenedor-botones">
                        <ButtonSubmit
                            type="submit"
                            onClick={handleSubmit(handleComplemento)}
                            icon={<CircleCheck />}
                        >
                            Aceptar
                        </ButtonSubmit>
                    </div>
                </form>
            </Modal>
        </>
    );
}
