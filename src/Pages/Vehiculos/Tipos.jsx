import { AppContext } from "@/context/AppContext"
import { useEffect, useContext, useState } from "react"
import clienteAxios from "@/config/axios"
import Tabla from "@/components/Tabla";
import Modal from "@/components/Modal";
import ErrorLabel from '@/components/UI/ErrorLabel';
import { toast } from "react-toastify";

export default function Tipos() {

    const { fetchTypes, types, requestHeader } = useContext(AppContext);

    // const [tipo, setTipo] = useState({});
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});


    const [modalCreate, setModalCreate] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await clienteAxios.post("/api/vehicles/types", formData, requestHeader);
            setErrors({});
            fetchTypes();
            setModalCreate(false);
            toast.success("Tipo de vehículo creado correctamente");
        }
        catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error("Error al crear el tipo de vehículo");
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await clienteAxios.put(`/api/vehicles/types/${formData.id}`, formData, requestHeader);
            setErrors({});
            fetchTypes();
            setModalEdit(false);
            toast.success("Tipo de vehículo actualizado correctamente");
        }
        catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error("Error al actualizar el tipo de vehículo");
        }
    };


    useEffect(() => {
        fetchTypes();
    }, []);

    return (
        <>
            <h2 className="title-2">Tipos de vehículos</h2>

            <div className="contenedor-botones">
                <button 
                    className="btn"
                    onClick={() => setModalCreate(true)}
                >
                    Añadir tipo
                </button>
            </div>

            <Tabla
                columns={[
                    { title: "ID", field: "id" },
                    { title: "Tipo", field: "type" },
                    { title: "Orden", field: "order" },
                ]}
                data={types}
                onRowClick={(e, row) => {
                    const data = row.getData();
                    setFormData(data);
                    setModalEdit(true);
                }}
            />

            <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)}>
                <h3 className="title-3">Crear tipo de vehículo</h3>

                <form action="">
                    <label htmlFor="type" className="label">Tipo de vehículo</label>
                    <input
                        type="text"
                        id="type"
                        className="input"
                        value={formData.type || ""}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="Ej. Camión, remolque, etc."
                        autoFocus
                    />
                    <ErrorLabel >{errors?.type}</ErrorLabel>

                    <button 
                        className="btn mt-4"
                        onClick={handleCreateSubmit}
                    >
                        Crear tipo
                    </button>
                </form>

            </Modal>

            <Modal isOpen={modalEdit} onClose={() => setModalEdit(false)}>
                <h3 className="title-3">Editar tipo de vehículo</h3>
                    <label htmlFor="type" className="label">Tipo de vehículo</label>
                    <input
                        type="text"
                        id="type"
                        className="input"
                        value={formData.type || ""}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="Ej. Camión, remolque, etc."
                        autoFocus
                    />
                    <ErrorLabel >{errors?.type}</ErrorLabel>

                    <label htmlFor="order" className="label">Orden</label>
                    <input
                        type="text"
                        id="order"
                        className="number"
                        value={formData.order || ""}
                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                        placeholder="Orden de prioridad "
                    />
                    <ErrorLabel >{errors?.order}</ErrorLabel>

                    <button 
                        className="btn mt-4"
                        onClick={handleUpdateSubmit}
                    >
                        Actualizar
                    </button>
            </Modal>

        </>
    )
}
