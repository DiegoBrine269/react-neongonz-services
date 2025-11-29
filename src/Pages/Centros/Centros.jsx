import { useContext, useEffect, useState } from "react";
import Tabla from "@/components/Tabla";
import clienteAxios from "@/config/axios";
import { AppContext } from "@/context/AppContext";
import Modal from "@/components/Modal";
import { toast } from "react-toastify";
import { CirclePlus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import  ErrorLabel  from '@/components/UI/ErrorLabel.jsx';

export default function Centros() {
    // const [centros, setCentros] = useState([]);
    const [centro, setCentro] = useState({});
    const { token, setLoading, centros, fetchCentros, fetchResponsables, responsables } = useContext(AppContext);

    const [isModalCreateOpen, setModalCreateOpen] = useState(false);
    const [isModalViewOpen, setModalViewOpen] = useState(false);


    const [formData, setFormData] = useState({
        name: "",
        responsible_id: "",
        location: "",
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.post("/api/centres",
                formData,
                {headers: {
                    Authorization: `Bearer ${token}`,
                }},
            );

            fetchCentros();
            setModalCreateOpen(false);
            toast.success("Centro de venta cargado correctamente");
            setFormData({
                name: "",
                responsible: "",
                location: "",
            });
            setErrors({});

        } catch (error) {
            console.error("Error during login:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
        finally {
            setLoading(false);
        }
    }


    // Consultar todas las agencias  al cargar el componente
    useEffect(() => {
        const fetchData = async () => {
            // setLoading(true);
            await fetchCentros();
            // setLoading(false);
            await fetchResponsables();
        };

        fetchData();
    }, []);

    const columns = [
        { title: "Nombre", field: "name", headerFilter: "input", resizable: false,},
        { 
            title: "Responsable(s)", 
            headerFilter: "input", 
            field: "responsibles",
            resizable: false,
            formatter: cell => 
                Array.isArray(cell.getValue())
                    ? cell.getValue().map(item => item.name).join(', ')
                    : '',
            headerFilterFunc: (headerValue, rowValue) => {
                if (!headerValue) return true;
                if (Array.isArray(rowValue)) {
                    return rowValue.some(item =>
                        item.name.toLowerCase().includes(headerValue.toLowerCase())
                    );
                }   
            }
        },
        { title: "Ubicación", field: "location", headerFilter: "input", width: 400, resizable: false,},
    ];
    
    return (
        <>
            <h2 className="title-2">Centros de venta</h2>

            <div className="contenedor-botones">
                <button
                    className="btn"
                    onClick={() => {
                        setModalCreateOpen(true);
                    }}
                >
                    <CirclePlus />
                    Nuevo
                </button>

                <Link to={'/responsables'} className="btn btn-secondary">
                    <UsersRound/>
                    Responsables
                </Link>
            </div>

            


            <Tabla
                events={{
                    rowClick: (e, row) => {
                        setModalViewOpen(true);
                        const data = row.getData();
                        setCentro(data);
                    },
                }}
                columns={columns}
                data={centros}
                title={"Listado de centros de venta"}
            />

            <Modal
                isOpen={isModalCreateOpen}
                onClose={() => setModalCreateOpen(false)}
            >
                <h2 className="title-3">Nuevo centro de ventas</h2>

                <form action="">
                    <label className="label" htmlFor="nombre">
                        Nombre
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="nombre"
                        placeholder="Nombre del centro"
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    {errors.name && (
                        <p className="text-red-500">{errors.name[0]}</p>
                    )}

                    <label className="label" htmlFor="responsible_id">
                        Responsable del centro
                    </label>
                    <select  
                        id="responsible_id"
                        className="input"
                        value={formData.responsible_id}
                        onChange={e => setFormData({...formData, responsible_id: e.target.value})}    
                    >
                        <option value="">Selecciona un responsable</option>
                        {
                            responsables?.map(responsible => (
                                <option
                                    key={responsible.id}
                                    value={responsible.id}
                                >
                                    {responsible.name}
                                </option>
                            ))
                        }
                    </select>

                    <ErrorLabel>{errors.responsible_id}</ErrorLabel>

                    <label className="label" htmlFor="location">
                        Ubicación
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="location"
                        placeholder="Ubicación o dirección del centro"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value,
                            })
                        }
                    />
                    {errors.location && (
                        <p className="text-red-500">{errors.location[0]}</p>
                    )}

                    <div className="contenedor-botones">
                        <input
                            className="btn"
                            type="submit"
                            value="Guardar"
                            onClick={handleSubmit}
                        />

                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isModalViewOpen}
                onClose={() => setModalViewOpen(false)}
            >
                <h2 className="title-3">Centro de ventas</h2>
                <div className="flex flex-col gap-3 pl-2">
                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Nombre
                        </span>{" "}
                        <p>{centro?.name}</p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Responsable
                        </span>{" "}
                        <p>
                            {
                                Array.isArray(centro.responsibles) ? centro.responsibles.map(item => item.name).join(', '): ''
                            }
                        </p>
                    </div>

                    <div className="text">
                        <span className="font-bold border-b-1 block border-neutral-400">
                            Ubicación
                        </span>{" "}
                        <p>{centro?.location}</p>
                    </div>
                </div>

                <div className="contenedor-botones">
                    <button className="btn" onClick={() => setModalViewOpen(false)}>Aceptar</button>
                    <Link to={`/centros-de-venta/editar/${centro.id}`} className="btn btn-secondary">Editar</Link>

                </div>
            </Modal>
        </>
    );
}
