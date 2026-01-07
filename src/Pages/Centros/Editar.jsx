import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import { useContext, useEffect, useState } from "react";
import clienteAxios from "@/config/axios";
import { toast } from "react-toastify";
import ErrorLabel  from '@/components/UI/ErrorLabel';
import PeerLabel from '@/components/UI/PeerLabel';
import {useSelection} from "@/hooks/useSelection";

export default function Editar() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [centro, setCentro] = useState({});
    const [errors, setErrors] = useState({});
    
    const { token, setLoading, fetchResponsables, responsables, fetchCustomers, customers} = useContext(AppContext);
    
    const { selected, toggle, clear, isSelected, setSelected, selectAll } = useSelection();

    const [formData, setFormData] = useState({
        name: "",
        responsibles: [],
        location: "",
    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await clienteAxios.put(`/api/centres/${id}`,
                formData,

                {headers: {
                    Authorization: `Bearer ${token}`,
                }},
            );  
            toast.success("Centro de venta actualizado correctamente");
            navigate("/centros-de-venta");
            setErrors({});
        } catch (error) {
            console.error("Error during update:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error("Error al actualizar el centro de venta");
        }
        finally {
            setLoading(false);
        }
    }

    const fetchCentro = async (id) => {
        try {
            const res = await clienteAxios.get(`/api/centres/${id}`, {
                headers: {Authorization: `Bearer ${token}`,},
            });
            setCentro(res.data);
            setFormData(res.data);

            res.data.responsibles.forEach(r => {
                toggle(r.id);
            });

            console.log(res.data);
            

        } catch (error) {
            toast.error("Error al cargar el centro");
            console.error("Error fetching data:", error);
        }   
    }

    useEffect(() => {
        fetchCentro(id);
        fetchResponsables();
        fetchCustomers();
    }, [id]);

    
    useEffect(() => {
        setFormData({
            ...formData,
            responsibles: selected,
        });
    }, [selected]);

    return (
        <>
            <h2 className="title-2">Editar Centro {centro.name}</h2>

            <form>
                <label htmlFor="name" className="label">Nombre:</label>
                <input 
                    type="text" 
                    id="name" 
                    className="input" 
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <ErrorLabel>{errors?.name}</ErrorLabel>

                <label htmlFor="name" className="label">Cliente:</label>
                <select
                    onChange={e => setFormData({...formData, customer_id: e.target.value})}
                    value={formData.customer_id || ''}
                >
                    <option value="">Selecciona un cliente</option>
                     {customers?.map(customer => (
                        <option 
                            key={customer.id}
                            value={customer.id}
                        >
                            {customer.legal_name}
                        </option>
                    ))} 
                </select>
                <ErrorLabel>{errors?.customer_id}</ErrorLabel>

                <label htmlFor="location" className="label">Ubicación:</label>
                <input 
                    type="text" 
                    id="location" 
                    className="input" 
                    placeholder="Ubicación" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                />
                <ErrorLabel>{errors?.name}</ErrorLabel>

                
                <label htmlFor="location" className="label">Responsables:</label>
                
                <div className="flex gap-1 flex-wrap pl-2">
                    {
                        responsables?.map(responsible => (
                            <PeerLabel
                                key={responsible.id}
                                label={responsible.name}
                                value={responsible.id}
                                checked={isSelected(responsible.id)}
                                tooltip={{email: {label:'Correo electrónico',value:responsible.email}}}
                                onChange={() => toggle(responsible.id)}
                            />
                            // <div key={responsible.id} className="p-2 border rounded mb-2">
                            //     {responsible.name} - {responsible.email}
                            // </div>
                        ))
                    }
                </div>

                <div className="contenedor-botones">
                    <button type="submit" className="btn" onClick={handleSubmit}>Guardar</button>

                </div>

            </form>
            
        </>
    )
}
