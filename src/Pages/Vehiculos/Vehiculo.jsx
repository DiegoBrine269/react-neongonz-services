import { useParams } from "react-router-dom";
import { useState, useEffect, useContext, use } from "react";
import { AppContext } from "@/context/AppContext";
import clienteAxios from "@/config/axios";   
import InfoRow from '@/components/UI/InfoRow';
import { Link } from "react-router-dom";
import { format } from "@formkit/tempo";

export default function Vehiculo() {

    const { id } = useParams();
    const [vehiculo, setVehiculo] = useState({});

    const { requestHeader } = useContext(AppContext);

    const fetchVehiculo = async () => {
        try {
            const { data } = await clienteAxios.get(`/api/vehicles/${id}`, requestHeader);
            setVehiculo(data);
        }   
        catch (error) {
            console.error("Error fetching vehicle data:", error);
        }
    };

    useEffect(() => {
        fetchVehiculo();
    }, [id]);

    useEffect(() => {
        console.log(vehiculo);
    }, [vehiculo]);

    return (
        <>
            <h2 className='title-2'>{vehiculo?.eco} ({vehiculo?.type?.type})</h2>

            <InfoRow label="Económico" value={vehiculo?.eco} />
            <InfoRow label="Tipo" value={vehiculo?.type?.type} />
            <InfoRow label="Centro" value={vehiculo?.centre?.name} />


            <h3 className="title-3 mt-4 mb-0">Proyectos</h3>
            {vehiculo?.projects?.length > 0 ? (
                <table className="w-full  border-collapse text">
                    <thead>
                        <tr className="border-b border-neutral-300">
                            <th className="py-1 pr-4 font-semibold">Servicio</th>
                            <th className="py-1 font-semibold">Centro</th>
                            <th className="py-1 font-semibold">Fecha del proyecto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehiculo.projects.map((proyecto) => (
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
                <p className="text-neutral-400 text-sm">No hay proyectos asociados a este vehículo.</p>
            )}
        </>
    )
}
