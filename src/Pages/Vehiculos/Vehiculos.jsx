import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState, useRef } from "react";
import Modal from "@/components/Modal";
import Tabla from "../../components/Tabla";
import {Link} from "react-router-dom";
import { toast } from "react-toastify";


export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
    const { token, setLoading, centros, fetchCentros, tableRef } = useContext(AppContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isModal2Open, setModal2Open] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState([]);

    const [vehiculo, setVehiculo] = useState({
        eco: "",
        type_name: "",
        centre: {},
    });


    useEffect(() => {
        const fetchData = async () => {
            fetchCentros();
        };

        fetchData();
        // setFormData(...formData, centre_id: );
    }, []);


        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                const { data } = await clienteAxios.put(`/api/vehicles/${vehiculo.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setErrors({});
                toast.success('Vehículo actualizado');
                setModal2Open(false);
                console.log(tableRef);
                tableRef.current.setData();
            } catch (error) {
                console.error("Error :", error);
            } finally {
                setLoading(false);
            }
        };


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
                            resizable: false,
                        },
                        {
                            title: "Tipo",
                            field: "type",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "Centro",
                            field: "centre.name",
                            headerFilter: true,
                            resizable: false,
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
                        filterMode: "remote",
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
                        <p>{vehiculo?.type}</p>
                    </div>
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Centro de ventas
                        </span>{" "}
                        <p>{vehiculo?.centre?.name}</p>
                    </div>

                    {vehiculo.projects?.length > 0 && (
                        <div className="text">
                            <span className="font-bold border-b-1 block border-neutral-400">
                                Proyectos recientes
                            </span>{" "}
                            <ul className="text-sm list-disc pl-5 mt-1">
                                {vehiculo.projects.map((project) => (
                                    <li className="link" key={project.id}>
                                        <Link to={`/proyectos/${project.id}`}>
                                            {project.service.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="contenedor-botones">
                    <button
                        className="btn btn-danger"
                        onClick={() => {
                            setModalOpen(false);
                            setModal2Open(true);
                        }}
                    >
                        Mover de CV
                    </button>

                    <button
                        className="btn"
                        onClick={() => {
                            setModalOpen(false);
                        }}
                    >
                        Aceptar
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isModal2Open} onClose={() => setModal2Open(false)}>
                <h2 className="title-3">Mover de centro de ventas</h2>
                <form>
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
                        defaultValue={vehiculo.centre.id}
                    >
                        {centros.map((centro) => (
                            <option key={centro.id} value={centro.id}>
                                {centro.name}
                            </option>
                        ))}
                    </select>
                    {errors.centre_id && (
                        <p className="text-red-500">{errors.centre_id[0]}</p>
                    )}
                </form>

                <div className="contenedor-botones">
                    <button
                        className="btn"
                        onClick={() => {
                            setModal2Open(false);
                        }}
                    >
                        Cancelar
                    </button>

                    <button className="btn btn-danger " onClick={handleSubmit}>
                        Aceptar
                    </button>
                </div>
            </Modal>
        </>
    );
}
