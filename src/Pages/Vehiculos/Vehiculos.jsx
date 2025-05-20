import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState } from "react";
import { ReactTabulator } from "react-tabulator";
import Modal from "@/components/Modal";
import { tabulatorConfig } from "../../config/variables";
import Tabla from "../../components/Tabla";

export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
    const { token, setLoading } = useContext(AppContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [vehiculo, setVehiculo] = useState({
        eco: "",
        type_name: "",
        centre_name: "",
    });

    const fetchVehiculos = async () => {
        try {
            const res = await clienteAxios.get("/api/vehicles", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setVehiculos(res.data);
        } catch (error) {
            setVehiculos([]);
            console.error("Error fetching data:", error);
        }
    }

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);
    //         await fetchVehiculos();
    //         setLoading(false);
    //     };

    //     fetchData();
    // }, []);


    return (
        <>
            <h2 className="title-2">Listado de vehículos</h2>

            <div>
                <Tabla
                    columns={[
                        {
                            title: "Económico",
                            field: "eco",
                            headerFilter: true,
                        },
                        {
                            title: "Tipo",
                            field: "type",
                            headerFilter: true,
                        },
                        {
                            title: "Centro",
                            field: "centre",
                            headerFilter: true,
                        },
                    ]}
                    layout="fitColumns"
                    options={{
                        pagination: true, //enable pagination
                        paginationMode: "remote", //enable remote pagination
                        ajaxURL: `${import.meta.env.VITE_API_URL}/api/vehicles`,
                        ajaxConfig: {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                        filterMode:"remote",

                    }}
                    events={{
                        rowClick: (e, row) => {
                            const data = row.getData();
                            setVehiculo(data);
                            setModalOpen(true);
                        },
                    }}
                    
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="title-3">Vehículo</h2>
                <div className="flex flex-col gap-3 pl-2">
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Económico
                        </span>{" "}
                        <p>{vehiculo?.eco}</p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Tipo
                        </span>{" "}
                        <p>{vehiculo?.type_name}</p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Centro de ventas
                        </span>{" "}
                        <p>{vehiculo?.centre_name}</p>
                    </div>
                </div>

                <button
                    className="btn"
                    onClick={() => {
                        setModalOpen(false);
                    }}
                >
                    Aceptar
                </button>
            </Modal>
        </>
    );
}
