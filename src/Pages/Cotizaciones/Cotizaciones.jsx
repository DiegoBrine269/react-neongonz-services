
import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import Tabla from "../../components/Tabla";
import { useContext, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Modal from "../../components/Modal";
import clienteAxios from "../../config/axios";
import { Trash2, CircleCheck } from "lucide-react";

export default function Cotizaciones() {

    const API_URL = import.meta.env.VITE_API_URL;
    const [cotizacion, setCotizacion] = useState({
    });


    const [modal, setModal] = useState(false);
    const tableRef = useRef();

    const { token, setLoading } = useContext(AppContext);

    const [reloadKey, setReloadKey] = useState(0);

    const recargarTabla = () => {
        setReloadKey((prev) => prev + 1);
    };

    async function fetchPDF() {
        try {
            setLoading(true);
            const res = await clienteAxios.get(`/api/invoices/${cotizacion?.id}/pdf`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
            });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");

        } catch (error) {

            console.error("Error fetching data:", error);
            toast.error("Error al descargar el PDF");
        }
        finally {
            setLoading(false);
        }
    }

    async function handleEliminarCotizacion() {
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
    

    return (
        <>
            <h2 className="title-2">Cotizaciones</h2>

            <Link className="btn mb-4" to="/cotizaciones/nueva">
                <CirclePlus />
                Nueva
            </Link>

            <div>
                <Tabla
                    key={reloadKey}
                    columns={[
                        {
                            title: "Centro",
                            field: "centre",
                            headerFilter: true,
                        },
                        {
                            title: "Fecha",
                            field: "date",
                            headerFilter: true,
                            headerFilterParams: {
                                elementAttributes: {
                                    type: "date",
                                },
                            },
                        },
                        {
                            title: "Número",
                            field: "invoice_number",
                            headerFilter: true,
                        },

                        {
                            title: "Monto total",
                            field: "total",
                            headerFilter: "number",
                            headerFilterFunc: "=",
                            formatter: (cell) => {
                                return cell.getValue()
                                    ? "$ " + cell.getValue()
                                    : null;
                            },
                        },
                    ]}
                    ref={tableRef}
                    layout="fitColumns"
                    options={{
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
                    events={{
                        rowClick: (e, row) => {
                            const data = row.getData();
                            setCotizacion(data);
                            setModal(true);
                        },
                    }}
                />
            </div>

            <Modal isOpen={modal} onClose={() => setModal(false)}>
                <h2 className="title-3">{cotizacion?.invoice_number}</h2>
                <div className="flex flex-col gap-3 pl-2">
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Centro de ventas
                        </span>{" "}
                        <p>{cotizacion?.centre}</p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Fecha
                        </span>{" "}
                        <p>{cotizacion?.date}</p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Monto total
                        </span>{" "}
                        <p>$ {cotizacion?.total}</p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Archivo
                        </span>{" "}
                        <button
                            className="underline cursor-pointer py-1"
                            onClick={fetchPDF}
                        >
                            Ver pdf 📄
                        </button>
                    </div>

                    <div className="md:flex gap-1">
                        <button
                            className="btn btn-danger"
                            onClick={handleEliminarCotizacion}
                        >
                            <Trash2 />
                            Eliminar
                        </button>
                        <button
                            className="btn"
                            onClick={() => {
                                setModal(false);
                            }}
                        >
                            <CircleCheck />
                            Aceptar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
