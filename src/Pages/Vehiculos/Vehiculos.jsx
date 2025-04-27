import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState } from "react";
import { ReactTabulator } from "react-tabulator";
import Modal from "@/components/Modal";

export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
    const { token } = useContext(AppContext);
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

    useEffect(() => {
        fetchVehiculos();
    }, []);

    return (
        <>
            <h2 className="title-2">Listado de vehículos</h2>

            <div>
                <ReactTabulator
                    data={vehiculos} // Set the table data
                    columns={[
                        {
                            title: "Económico",
                            field: "eco",
                            headerFilter: true,
                        },
                        {
                            title: "Tipo",
                            field: "type_name",
                            headerFilter: true,
                        },
                        {
                            title: "Centro",
                            field: "centre_name",
                            headerFilter: true,
                        },
                    ]}
                    layout="fitColumns"
                    options={{
                        pagination: true,
                        paginationSize: 10,
                        movableColumns: true,
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
            >
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
