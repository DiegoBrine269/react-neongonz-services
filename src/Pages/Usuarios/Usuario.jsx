import InfoRow from '@/components/UI/InfoRow';
import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import clienteAxios from '@/config/axios';
import { AppContext } from '@/context/AppContext';
import { format } from '@formkit/tempo';
import { Pencil } from 'lucide-react';

import Tabla from '@/components/Tabla';

export default function Usuario() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState({});
    const {requestHeader, token } = useContext(AppContext)

    async function fetchUsuario() {
        try {
            const res = await clienteAxios.get(`/api/users/${id}`, requestHeader);

            setUsuario(res.data.user);
        } catch (error) {
            setUsuario({});
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el usuario");
        }
    }

    useEffect(()=>{
        fetchUsuario();
    }, []);

    return (
        <>
            <h2 className="title-2">{usuario.name} {usuario.last_name}</h2>

            <InfoRow label="Email:" value={usuario.email} />
            <InfoRow label="Rol:" value={usuario.role} />
            <InfoRow label="Estado:" value={usuario.is_active ? "Activo" : "Inactivo"} />
            <InfoRow label="Miembro desde:" value={format(usuario.created_at, 'DD/MM/YYYY')} />

            <h3 className="title-3 mt-2">Registros</h3>

            <Tabla
            
                className="custom-table"
                columns={[
                    // { title: "ID", field: "id" },
                    { title: "Centro", field: "project.centre.name" },
                    { title: "Proyecto", field: "project.service.name" },
                    { title: "Vehículo", field: "vehicle.eco" },
                    { title: "Fecha de creación", field: "created_at", formatter: (cell) => format(cell.getValue(), 'DD/MM/YYYY') },
                ]}
                
                options={{
                    // selectable: true,
                    pagination: true, //enable pagination
                    paginationMode: "remote", //enable remote pagination
                    ajaxURL: `${import.meta.env.VITE_API_URL}/api/users/${id}/project-vehicles`, //set url for ajax request
                    ajaxConfig: {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                    ajaxResponse: (url, params, response) => response.project_vehicles, 
                    filterMode: "remote",
                }}

                onRowClick={(e, row) => {
                    navigate(`/proyectos/${row.getData().project.id}`);
                }}

                title={`Registros de ${usuario.name} ${usuario.last_name}`}
            />

        </>
    )
}
