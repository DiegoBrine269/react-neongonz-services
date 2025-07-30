import { AppContext } from "@/context/AppContext";
import { useContext, useEffect, useState } from "react";
import clienteAxios from "@/config/axios";
import Tabla from "@/components/Tabla";
import {format} from "@formkit/tempo"
import { UserSearch } from "lucide-react";

export default function Desempeno() {
    
    const {usuarios, fetchUsuarios, token, loading, setLoading} = useContext(AppContext);

    const [usuario, setUsuario] = useState({});

    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        date_start: format(new Date(), 'YYYY-MM-DD'),
        date_end: format(new Date(), 'YYYY-MM-DD'),
    });

    const columns = [
        {
            title: "Eco",
            field: "vehicle.eco",
            headerFilter: true,
            resizable: false,
        },
        {
            title: "Centro",
            field: "project.centre.name",
            headerFilter: true,
            resizable: false,
        },
        {
            title: "Servicio",
            field: "project.service.name",
            headerFilter: true,
            resizable: false,
        },
        {
            title: "Fecha",
            field: "created_at",
            formatter: (cell) => {
                const date = cell.getValue();
                return format(date, { date: "short" }, "es");
            },
            headerFilter: true,
            resizable: false,
        },
    ];

    useEffect(()=> {
        fetchUsuarios();
    }, []);

    useEffect(()=> {
        setData([])
    }, [usuario, formData]);

    const handleSubmit = async (e) =>{
        e.preventDefault();

        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/users/${usuario.id}/performance?${formData.date_start !== "" ? `&date_start=${formData.date_start}`: ''}${formData.date_end !== "" ? `&date_end=${formData.date_end}`: ''}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log(res.data);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        finally{
            setLoading(false);
        }
    }
    
    return (
        <>
            <h2 className="title-2">Reportes de desempeño</h2>

            <form>
                <label htmlFor="usuario" className="label">Usuario</label>
                <select 
                    id="usuario" 
                    className="usuario" 
                    value={usuario.id ?? ""}
                    onChange={e => setUsuario(usuarios.find(u => u.id === +e.target.value))}
                >
                    <option disabled value="">Selecciona un usuario</option>
                    {usuarios.map(u => u.is_active && <option key={u.id} value={u.id}>{u.name} {u.last_name}</option>)}
                </select>

                <div className="sm:grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="fecha_inicio" className="label">Desde</label>
                        <input 
                            type="date" 
                            id="fecha_inicio"
                            value={formData.date_start}
                            onChange={(e)=>setFormData({...formData, date_start:e.target.value})}
                        />
                    </div>

                    <div>
                        <label htmlFor="fecha_fin" className="label">Hasta</label>
                        <input 
                            type="date" 
                            id="fecha_fin"
                            value={formData.date_end}
                            onChange={(e)=>setFormData({...formData, date_end:e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="btn" onClick={handleSubmit}>
                        <UserSearch/>
                        Consultar
                    </button>
                </div>
            </form>

            <Tabla
                title={`Reporte de desempeño de ${usuario?.name} ${usuario?.last_name}`}
                columns={columns}
                data={data}
            >

            </Tabla>
        
        </>
    )
}
