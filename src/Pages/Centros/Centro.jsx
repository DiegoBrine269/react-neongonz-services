import InfoRow from '@/components/UI/InfoRow';
import { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import clienteAxios from '@/config/axios';
import { AppContext } from '@/context/AppContext';
import { format } from '@formkit/tempo';
import { Pencil } from 'lucide-react';

export default function Centro() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [centro, setCentro] = useState({});
    const {requestHeader} = useContext(AppContext)

    async function fetchCentro() {
        try {
            const res = await clienteAxios.get(`/api/centres/${id}`, requestHeader);

            setCentro(res.data);
            console.log(res.data)
        } catch (error) {
            setCentro({});
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el centro");
        }
    }

    useEffect(()=>{
        fetchCentro();
    }, []);

    return (
        <>
            <div className="flex justify-between items-center w-full">
                <h2 className="title-2">Centro</h2>
                <button
                    onClick={() => {
                        navigate(`/centros-de-venta/editar/${centro.id}`);
                    }}
                    className="cursor-pointer"
                >
                    <Pencil className="text w-5" />
                </button>
            </div>


            <InfoRow label="Ubicación" value={centro?.location} />
            {centro?.responsibles?.length > 0 && (
                <InfoRow 
                    label="Responsables" 
                    value={centro.responsibles.map(r => r.name).join(", ")} 
                />
            )}

            <h3 className="title-3 mt-4 mb-0">Proyectos</h3>

            {centro?.projects?.length > 0 ? (
                <table className="w-full border-collapse text">
                    <thead>
                        <tr className="border-b border-neutral-300">
                            <th className="py-1 pr-4 font-semibold">Servicio</th>
                            <th className="py-1 font-semibold">Centro</th>
                            <th className="py-1 font-semibold">Fecha del proyecto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {centro.projects.map((proyecto) => (
                            <tr key={proyecto.id} className="border-b border-neutral-100 ">
                                <td className="py-1 pr-4 text-sm">
                                    <Link to={`/proyectos/${proyecto.id}`} className="text-blue-500 underline">
                                        {proyecto.service?.name}
                                    </Link>
                                </td>
                                <td className="py-1 text text-sm">
                                    {proyecto.centre?.name}
                                </td>
                                <td className="py-1 text text-right text-sm">
                                    {proyecto.date ? format(proyecto.date, { date: "medium" }, "es") : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-neutral-400 text-sm">No hay proyectos asociados a este centro.</p>
            )}
            
        </>
    )
}
