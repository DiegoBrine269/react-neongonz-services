import { useParams } from 'react-router-dom';
import {AppContext} from '../../context/AppContext';
import { use, useContext, useEffect, useState } from 'react';
import clienteAxios from '../../config/axios';
import { toast } from 'react-toastify';
import { Save } from 'lucide-react';

export default function Servicio() {

    const { id } = useParams();

    const [servicio, setServicio] = useState({});
    const [types, setTypes] = useState([]);
    const [units, setUnits] = useState([]);
    const [errors, setErrors] = useState({});
    // const [vehicles_types_prices, setVehiclesTypesPrices] = useState([]);

    const { token, setLoading, fetchCentros, centros } = useContext(AppContext);

    const [formData, setFormData] = useState({
        id: '',
        centre_id: null,
        name: '',
        sat_unit_key: '',
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
                ...res.data,
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

    const getPrice = (typeId) => {
        const centreId =
            formData.centre_id !== null && formData.centre_id !== undefined
                ? Number(formData.centre_id)
                : null;

        const prices = formData.vehicles_types_prices ?? [];

        if (centreId !== null) {
            const specific = prices.find(
                p =>
                    p.vehicle_type_id === typeId &&
                    Number(p.centre_id) === centreId
            );
            if (specific) return specific.price;
        }

        const general = prices.find(
            p =>
                p.vehicle_type_id === typeId &&
                (p.centre_id === null || p.centre_id === undefined)
        );

        return general?.price ?? "";
    };


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

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await clienteAxios.get(`/api/invoices/units`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnits(res.data);
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

            //Eliminar {} de vehicles_types_prices
            const cleanedPrices = formData.vehicles_types_prices.filter(
                price => Object.keys(price).length !== 0
            );

            const payload = {
                ...formData,
                vehicles_types_prices: cleanedPrices,
            };

            await clienteAxios.put(`/api/services/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // setFormData({
            //     id: '',
            //     name: '',
            //     vehicles_types_prices: []
            // });
            fetchServicio();
            toast.success("Servicio actualizado correctamente");
            setErrors([]);
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

    // useEffect(() => {
    //     console.log('formData changed:', formData);
    // }, [formData]);

    useEffect(() => {
        // Reset vehicle prices when centre_id changes
 
        // console.log()
 
        // debugger
        setFormData((prev) => ({
            ...prev,
            vehicles_types_prices: []
        }));        

        if(formData.centre_id){
            setFormData((prev) => ({
                ...prev,
                // vehicles_types_prices: servicio.vehicle_types.filter((price => price.pivot.centre_id === formData.centre_id))
                vehicles_types_prices: servicio.vehicle_types.map((item) => item.pivot.centre_id === formData.centre_id ? item.pivot : {})
                
            }));
        
            return;
        }

        setFormData((prev) => ({
            ...prev,
            vehicles_types_prices: servicio?.vehicle_types?.map((item) => item.pivot )

        }));


    }, [formData.centre_id]);

    useEffect(() => {
        fetchServicio();
        fetchTypes();
        fetchUnits();
        fetchCentros();
    }, []);

    useEffect(() => {
        if (servicio.name) {
            setFormData((prev) => ({
                ...prev,
                name: servicio.name,
            }));
        }
    }, [servicio]);


    return (
        <div className='lg:w-1/2 lg:mx-auto'>
            <h2 className="title-2">{servicio.name}</h2>
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

                <label htmlFor="name" className="label">
                    Unidad de medida del SAT
                </label>
                <select 
                    id="sat_unit_key"
                    value={formData.sat_unit_key}
                    onChange={(e) => {
                        setFormData((prev) => ({
                            ...prev,
                            sat_unit_key: e.target.value,
                        }));

                    }}
                >
                    <option value="" disabled>Selecciona una opción</option>
                    {units.map((unit) => (
                        <option
                            key={unit.key}
                            value={unit.key}
                        >
                            {unit.name} ({unit.key})
                        </option>
                    ))}
                </select>
                {errors.sat_unit_key && <p className="error">{errors.sat_unit_key}</p>}


                <label htmlFor="name" className="label">
                    Centro
                </label>
                <select 
                    id="centre_id"
                    value={formData.centre_id || ''}
                    onChange={(e) => {
                        const centreId = e.target.value;
                        setFormData((prev) => ({
                            ...prev,
                            centre_id: centreId ? Number(centreId) : null,
                        }));

                    }}
                >
                    <option value="">Para todos los centros de venta</option>
                    {centros.map((centre) => (
                        <option
                            key={centre.id}
                            value={centre.id}
                        >
                            {centre.name}
                        </option>
                    ))}
                </select>

                <div>
                    <h3 className='title-3 mb-0 mt-3'>Precios por tipo de vehículo</h3>    
                    
                    <div className='pl-3'>
                        {types.map((type) => (
                            <div key={type.id}>
                                <label htmlFor={type.id} className="label">
                                    {type.type}
                                </label>
                                <input
                                    id={type.id}
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={getPrice(type.id)}
                                    // value={formData.vehicles_types_prices.find((price) => price.vehicle_type_id === type.id)?.price ?? "" }

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
                    </div>
                </div>
            </form>

            <button
                className="btn mt-4"
                type="submit"
                onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <Save/>
                Guardar
            </button>
        </div>
    );
}
