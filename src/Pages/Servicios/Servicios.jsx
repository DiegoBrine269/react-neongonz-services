import { useContext, useEffect, useState } from "react";
import Tabla from "../../components/Tabla";
import clienteAxios from "../../config/axios";
import { AppContext } from "../../context/AppContext";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CirclePlus } from "lucide-react";

export default function Servicios() {
    const [servicios, setServicios] = useState([]);
    const navigate = useNavigate();

    const { token, setLoading, totalFilas, setTotalFilas } = useContext(AppContext);

    const [isModalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description_id: "",
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await clienteAxios.post("/api/services", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(data);
            fetchServicios();
            setModalOpen(false);
            toast.success("Servicio creado correctamente");
            setFormData({
                name: "",
            });
            setErrors({});
        } catch (error) {
            console.error("Error during login:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
    };

    async function fetchServicios() {
        try {
            const res = await clienteAxios.get("/api/services", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setServicios(res.data);
        } catch (error) {
            setServicios([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los servicios");
        }
    }

    const handleRowClick = (e, row) => {
        const id = row.getData().id;
        navigate(`/servicios/${id}`);
    };

    // Consultar todas las agencias  al cargar el componente
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchServicios();
            setLoading(false);
        };

        fetchData();
    }, []);

    const columns = [
        { field: "id", visible: false},
        { title: "Nombre", field: "name", headerFilter: "input" },
    ];

    return (
        <>
            <h2 className="title-2">Catálogo de servicios</h2>
            <button
                className="btn mb-4"
                onClick={() => {
                    setModalOpen(true);
                }}
            >
                <CirclePlus />
                Nuevo
            </button>


            <Tabla
                // options={{
                //     pagination: "local",
                //     paginationSize: 20,
                // }}
                events={{
                    rowClick: handleRowClick,
                }}
                columns={columns}
                data={servicios}
            />

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="title-3">Nuevo servicio</h2>

                <form action="">
                    <label className="label" htmlFor="nombre">
                        Nombre
                    </label>
                    <input
                        className="input"
                        type="text"
                        id="nombre"
                        placeholder="Nombre o descripción"
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    {errors.name && (
                        <p className="text-red-500">{errors.name[0]}</p>
                    )}

                    <input
                        className="btn"
                        type="submit"
                        value="Guardar"
                        onClick={handleSubmit}
                    />
                </form>
            </Modal>
        </>
    );
}
