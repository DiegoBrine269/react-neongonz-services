import { AppContext } from "@/context/AppContext"
import { useEffect, useContext, useState, use } from "react"
import clienteAxios from "@/config/axios"
import Tabla from "@/components/Tabla";
import Modal from "@/components/Modal";
import ErrorLabel from '@/components/UI/ErrorLabel';
import { toast } from "react-toastify";

export default function Clientes() {

    const { fetchCustomers, customers, requestHeader } = useContext(AppContext);

    const [modalCreate, setModalCreate] = useState(false);


    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <>
            <h2 className="title-2">Clientes fiscales</h2>

            <div className="contenedor-botones">
                <button 
                    className="btn"
                    onClick={() => setModalCreate(true)}
                >
                    Crear nuevo
                </button>
            </div>

            <Tabla  
                columns={[
                    { title: "ID ", field: "id" },
                    { title: "Razón social", field: "legal_name" },
                    { title: "RFC", field: "tax_id" },
                    { title: "C.P.", field: "address_zip" },
                ]}
                data={customers}
                
            />

            <Modal
                isOpen={modalCreate}
                onClose={() => setModalCreate(false)}
                title="Crear nuevo cliente"
            >
                <h2 className="title-2">Nuevo cliente fiscal</h2>

                <label htmlFor="legal_name" className="label">Razón social</label>
                <input type="text" id="legal_name" name="legal_name" placeholder="Razón social"/>
            </Modal>
        </>
    );
}
