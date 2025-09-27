import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import Tabla from "@/components/Tabla";
import { CirclePlus } from "lucide-react";
import Modal from "@/components/Modal";
import ErrorLabel from "@/components/UI/ErrorLabel";
import { toast } from "react-toastify";
import clienteAxios from "@/config/axios";

export default function Responsables() {


    const { fetchResponsables, responsables, setLoading, token } = useContext(AppContext);

    const [isModalCreateOpen, setModalCreateOpen] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });
    
    const columns = [
        { title: "Nombre", field: "name", headerFilter: "input", resizable: false,},
        { title: "Email", field: "email", headerFilter: "input", resizable: false,},

    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const { data } = await clienteAxios.post("/api/responsibles",
                formData,
                {headers: {
                    Authorization: `Bearer ${token}`,
                }},
            );

            fetchResponsables();
            setModalCreateOpen(false);
            toast.success("Responsable guardado correctamente");
            setFormData({});
            setErrors({});

        } catch (error) {
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchResponsables();
    }, []);

    return (
        <>
            <h2 className="title-2">Responsables de Centros</h2>

                <button
                    className="btn"
                    onClick={() => {
                        setModalCreateOpen(true);
                    }}
                >
                    <CirclePlus />
                    Nuevo
                </button>
            <Tabla
                columns={columns}
                data={responsables}
                
            />

            {/* <ModalCreateResponsable */}

            
            <Modal
                isOpen={isModalCreateOpen}
                onClose={() => setModalCreateOpen(false)}
            >
                <h3 className="title-3">Nuevo Responsable</h3>
                <form className="form">

                    <label className="label" htmlFor="name">Nombre</label>
                    <input 
                        type="text" 
                        id="name" 
                        placeholder="Nombre"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <ErrorLabel>{errors?.name}</ErrorLabel>

                    <label className="label" htmlFor="email">Correo electrónico</label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="Correo electrónico"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <ErrorLabel>{errors?.email}</ErrorLabel>

                    <div className="contenedor-botones">
                        <button type="submit" className="btn" onClick={handleSubmit}>Crear</button>
                    </div>
                </form>
            </Modal>

        </>
    )
}
