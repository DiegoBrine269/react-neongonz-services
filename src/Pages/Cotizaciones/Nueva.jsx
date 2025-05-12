import { useState } from "react";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import clienteAxios from "../../config/axios";
import { Printer } from "lucide-react";

export default function Nueva() {

    const { token, setLoading, user, totalFilas, setTotalFilas, centros, fetchCentros} = useContext(AppContext);

    const [centro, setCentro] = useState("");

    const [vehiculosPendientes, setVehiculosPendientes] = useState([]);
    const [centrosPendientes, setCentrosPendientes] = useState([]);
    const [proyectosPendientes, setProyectosPendientes] = useState([]);

    const [formData, setFormData] = useState({

        vehicles: [],
    });


    async function fetchVehiculos() {
        try {
            const res = await clienteAxios.get("/api/vehicles?invoice=pending",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCentrosPendientes(Array.from(new Set(res.data.map((item) => item.centre_id))));
            setProyectosPendientes(
                Array.from(
                    res.data
                        .map((item) => item.project) // Extrae los proyectos
                        .reduce((acc, project) => {
                            if (!acc.has(project.id)) {
                                acc.set(project.id, project); // Usa un Map para evitar duplicados
                            }
                            return acc;
                        }, new Map())
                        .values() // Obtén los valores únicos
                )
            );
            console.log(
                Array.from(new Set(res.data.map((item) => item.project)))
            );

            setVehiculosPendientes(res.data);
        } catch (error) {
            setVehiculosPendientes([]);
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los vehículos");
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchCentros()]);

            await Promise.all([fetchVehiculos()]);

            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <>
            <h2 className="title-2">Nueva cotización</h2>
            <p className="text">
                Tienes {vehiculosPendientes.length ?? 0} vehículos con
                cotización pendiente
            </p>

            <form action="">
                <label className="label" htmlFor="correo">
                    Centro de ventas
                </label>

                <select
                    id="centre_id"
                    className="input"
                    value={centro}
                    onChange={(e) => setCentro(e.target.value)}
                    defaultValue=""
                >
                    <option value="" disabled>
                        Seleccione un centro de ventas
                    </option>
                    {centros
                        .filter((centro) =>
                            centrosPendientes.includes(centro.id)
                        )
                        .map((centro) => (
                            <option key={centro.id} value={centro.id}>
                                {centro.name}
                            </option>
                        ))}
                </select>

                {centro !== "" && (
                    <div className="pt-4">
                        {proyectosPendientes.map((p) =>
                            p.centre_id == centro ? (
                                <div>
                                    <p className="title-3 mb-1 mt-4">
                                        {p.service}
                                    </p>

                                    <div className="flex gap-1 flex-wrap">
                                        {vehiculosPendientes.map(
                                            (v) =>
                                                v.project_id == p.id && (
                                                    <label
                                                        className="inline-flex items-center text-xs m-0"
                                                        key={v.id}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox-btn peer"
                                                            // onChange={() =>
                                                            //     // toggleProyectoExtra(p.id)
                                                            // }
                                                            // checked={formData?.extra_projects?.includes(
                                                            //     p.id
                                                            // )}
                                                        />
                                                        <span className="checkbox-label peer-checked:bg-blue-500 peer-checked:text-white peer-checked:ring-blue-500">
                                                            {v.eco}
                                                        </span>
                                                    </label>
                                                )
                                        )}
                                    </div>
                                </div>
                            ) : null
                        )}
                    <button
                        className="btn mt-4"
                        // onClick={() => {
                        //     setModalOpen(true);
                        // }}
                    >
                        <Printer />
                        Generar
                    </button>
                    </div>
                )}

            </form>
        </>
    );
}
