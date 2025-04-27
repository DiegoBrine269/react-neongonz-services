import { useParams } from 'react-router-dom';
import {AppContext} from '../../context/AppContext';
import { useContext, useEffect, useState } from 'react';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';

export default function Servicio() {

    const { id } = useParams();

    const [servicio, setServicio] = useState({});
    const [types, setTypes] = useState([]);
    const [errors, setErrors] = useState({});
    // const [vehicles_types_prices, setVehiclesTypesPrices] = useState([]);

    const { token, setLoading } = useContext(AppContext);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        vehicles_types_prices: []
    });
    

    const fetchServicio = async () => {
        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/services/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setServicio(res.data);
            setFormData({
                ...formData,
                vehicles_types_prices: res.data.vehicle_types.map(
                    (item) => item.pivot
                )}
            );
            // console.log(vehicles_types_prices);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el servicio");
        }
        finally {
            setLoading(false);
        }
    }

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/vehicles-types`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTypes(res.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar el servicio");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data } = await clienteAxios.put(`/api/services/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchServicio();
            toast.success("Servicio actualizado correctamente");
            setErrors([]);
            setFormData({
                id: '',
                name: '',
                vehicles_types_prices: []
            });
        } catch (error) {
            console.error("Error during login:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error("Error al actualizar el servicio");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServicio();
        fetchTypes();
    }, []);

    useEffect(() => {
        if (servicio.name) {
            setFormData((prev) => ({
                ...prev,
                name: servicio.name,
            }));
        }
    }
    , [servicio]);


    return (
        <>
            <h2 className="title-2">Precios de {servicio.name}</h2>
            <form>
                <label htmlFor="name" className="label">
                    Nombre del servicio
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name || servicio.name}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setFormData({
                            ...formData,
                            name: newValue,
                        });
                    }}
                />
                {errors.name && <p className="error">{errors.name}</p>}

                {types.map((type) => (
                    <div key={type.id}>
                        <label htmlFor={type.id} className="label">
                            {type.type}
                        </label>
                        <input
                            id={type.id}
                            type="number"
                            value={
                                formData.vehicles_types_prices.find(
                                    (price) => price.vehicle_type_id === type.id
                                )?.price 
                                // ||
                                // vehicles_types_prices.find(
                                //     (price) => price.vehicle_type_id === type.id
                                // )?.price 
                            }
                            placeholder="Precio"
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setFormData((prev) => {
                                    const existingPrice = prev.vehicles_types_prices.find(
                                        (price) => price.vehicle_type_id === type.id
                                    );

                                    let updatedPrices;
                                    if (existingPrice) {
                                        updatedPrices = prev.vehicles_types_prices.map((price) =>
                                            price.vehicle_type_id === type.id
                                                ? { ...price, price: newValue || null }
                                                : price
                                        );
                                    } else {
                                        updatedPrices = [
                                            ...prev.vehicles_types_prices,
                                            { vehicle_type_id: type.id, price: newValue || null },
                                        ];
                                    }

                                    return { ...prev, vehicles_types_prices: updatedPrices };
                                });
                            }}
                        />
                    </div>
                ))}
            </form>

            <input
                className="btn"
                type="submit"
                value="Guardar"
                onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            />
        </>
    );
}
