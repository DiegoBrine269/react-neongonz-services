import {useContext, useEffect, useState} from "react";
import { downloadBlobResponse } from "@/utils/downloadFile"; 
import { AppContext } from "@/context/AppContext";
import ErrorLabel from "@/components/UI/ErrorLabel";
import { useForm, useFieldArray } from "react-hook-form";
import { ListPlus } from "lucide-react";

import PartidasCotizacion from "@/components/PartidasCotizacion.jsx";

import ModalPrecios from "@/components/ModalPrecios";
import ModalCatalogo from "@/components/ModalCatalogo";

import clienteAxios from "@/config/axios";

import { getResponseErrors } from "@/utils/utils";
import { useNavigate } from 'react-router-dom';

import { toast } from "react-toastify";

export function Nueva() {
    const navigate = useNavigate();

    const { token, fetchCustomers, customers, setLoading, servicios, fetchServicios, productos, fetchProductos, isLoading } = useContext(AppContext);
    const [formData, setFormData] = useState({
        customer_id: "",
        payment_form: "",
        payment_date: "",
    });
    const [errors, setErrors] = useState({});

    const [modalOpen, setModalOpen] = useState(false);
    const [modalCatalogoOpen, setModalCatalogoOpen] = useState(false);
    const [catalogo, setCatalogo] = useState("");
    const [precios, setPrecios] = useState([]);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);

    const { register, control, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            items: [
                {
                    concept: "",
                    quantity: "",
                    price: "",
                    isListActive: false,
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const removeAll = () => {
        remove(fields.map((_, index) => index));
    };


    const onSubmit = async (data) => {
        setLoading(true);

        const payload = {
            ...formData,
            rows: data.items,
        };

        try {
            const response = await clienteAxios.post(
                `/api/billings/custom`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: "blob",
                },
            );

            toast.success("Factura emitida correctamente");
            navigate("/facturas");
            downloadBlobResponse(response, "Factura.pdf");
            setErrors({});
        } catch (error) {
            const body = await getResponseErrors(error);
            setErrors(body?.errors ?? {});
        } finally {
            setLoading(false);
        }

    };

    const abrirCatalogo = (index, tipo) => {
        setSelectedItemIndex(index);
        setCatalogo(tipo);
        setModalCatalogoOpen(true);
    };

    const handleServiceSelect = (index) => (id, name) => {
        let item;

        if (catalogo === "servicios") {
            item = servicios.find(
                (servicio) => servicio.id.toString() === id.toString(),
            );
            if (item) {
                setValue(`items.${index}.product`, item?.name);
                setValue(`items.${index}.sat_unit_key`, item?.sat_unit_key);
                setValue(
                    `items.${index}.sat_key_prod_serv`,
                    item?.sat_key_prod_serv?.trim(),
                );
            }

            if (item?.prices?.length > 0) {
                setPrecios(item.prices);
                setModalOpen(true);
            }
        } else if (catalogo === "productos") {
            item = productos.find(
                (producto) => producto.id.toString() === id.toString(),
            );
            if (item) {
                setValue(`items.${index}.product`, item?.name);
                setValue(`items.${index}.sat_unit_key`, item?.sat_unit_key);
                setValue(
                    `items.${index}.sat_key_prod_serv`,
                    item?.sat_key_prod_serv?.trim(),
                );
                setValue(`items.${index}.price`, item?.price);
            }
        }

        console.log("Selected item details:", item);
        setModalCatalogoOpen(false);
    };

    useEffect(() => {
        fetchCustomers();
        fetchServicios();
        fetchProductos();
    }, []);

    useEffect(() => {
        if (formData.payment_method === "PUE") {
            setFormData((prev) => ({
                ...prev,
                payment_date: new Date().toISOString().split("T")[0],
            }));
        }

        if (formData.payment_method === "PPD") {
            setFormData((prev) => ({
                ...prev,
                payment_date: "",
                payment_form: "99",
            }));
        }

        // if (formData.payment_form === "99" && formData.payment_method === "PUE") {
        //     setFormData((prev) => ({
        //         ...prev,
        //         payment_form: "PPD",
        //     }));
        // }

    }, [formData.payment_form, formData.payment_method]);


    return (
        <div>
            <h2 className="title-2">Nueva Factura</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset className="form-fieldset">
                    <h3 className="title-3">Cliente</h3>

                    <select 
                        id="customer_id"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                customer_id: e.target.value,
                            })
                        }
                        value={formData.customer_id}
                    >
                        <option value="">Seleccione un cliente</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.legal_name} ({customer.tax_id})
                            </option>
                        ))}
                    </select>
                    <ErrorLabel>{errors?.customer_id}</ErrorLabel>

                </fieldset>

                <fieldset className="form-fieldset">
                    <h3 className="title-3">Forma y método de pago</h3>

                    <label className="label" htmlFor="payment_method">
                        Método de pago:
                    </label>
                    <select
                        id="payment_method"
                        defaultValue=""
                        value={formData.payment_method || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                payment_method: e.target.value,
                            })
                        }
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        <option value="PUE">
                            (PUE) Pago en una sola exhibición
                        </option>
                        <option value="PPD">
                            (PPD) Pago en parcialidades o diferido
                        </option>
                    </select>
                    <ErrorLabel>{errors?.payment_method}</ErrorLabel>

                    <label className="label" htmlFor="payment_form">
                        Forma de pago:
                    </label>
                    <select
                        id="payment_form"
                        defaultValue=""
                        value={formData.payment_form}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                payment_form: e.target.value,
                            })
                        }
                        autoFocus
                    >
                        <option value="" disabled>
                            Selecciona una opción
                        </option>
                        <option value="99">Por definir</option>
                        <option value="01">Efectivo</option>
                        <option value="03">
                            Transferencia electrónica de fondos
                        </option>
                        <option value="28">Tarjeta de débito</option>
                        <option value="04">Tarjeta de crédito</option>
                    </select>
                    <ErrorLabel>{errors?.payment_form}</ErrorLabel>

                    <label className="label" htmlFor="payment_date">
                        Fecha de pago
                    </label>
                    <input
                        type="date"
                        className="input"
                        id="payment_date"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                payment_date: e.target.value,
                            })
                        }
                    />
                    <ErrorLabel>{errors?.payment_date}</ErrorLabel>
                </fieldset>

                <fieldset>
                    <h3 className="title-3">Partidas</h3>

                    <PartidasCotizacion
                        fields={fields ?? []}
                        errors={errors}
                        remove={remove}
                        register={register}
                        setValue={setValue}
                        onOpenCatalogo={abrirCatalogo}
                    />

                    <div className="contenedor-botones">
                        <button
                            className="w-auto btn"
                            type="button"
                            onClick={() =>
                                append({
                                    concept: "",
                                    quantity: "",
                                    price: "",
                                })
                            }
                        >
                            <ListPlus />
                        </button>
                    </div>
                </fieldset>

                <div className="contenedor-botones">
                    <button className="btn" type="submit" disabled={fields.length === 0 || isLoading}>
                        Emitir factura
                    </button>
                </div>
            </form>

            <ModalPrecios
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                precios={precios}
                onSelect={(precio) => {
                    setValue(`items.${selectedItemIndex}.price`, precio.price);
                    setModalOpen(false);
                }}
            />

            <ModalCatalogo
                isOpen={modalCatalogoOpen}
                onClose={() => setModalCatalogoOpen(false)}
                tipo={catalogo}
                items={catalogo === "servicios" ? servicios : productos}
                onSelect={handleServiceSelect(selectedItemIndex)}
            />
        </div>
    );
}
