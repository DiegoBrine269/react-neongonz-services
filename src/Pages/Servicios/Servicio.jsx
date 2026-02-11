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
    const [errors, setErrors] = useState({});
    // const [vehicles_types_prices, setVehiclesTypesPrices] = useState([]);

    const { token, setLoading, fetchCentros, centros, fetchUnits, units } = useContext(AppContext);

    const [formData, setFormData] = useState({
        id: '',
        centre_id: null,
        name: '',
        sat_unit_key: '',
        vehicles_types_prices: []
    });

    const currentCentreId =
        formData.centre_id === "" || formData.centre_id === undefined || formData.centre_id === null
            ? null
            : Number(formData.centre_id);

    

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
            formData.centre_id === "" || formData.centre_id === undefined || formData.centre_id === null
            ? null
            : Number(formData.centre_id);

        const prices = formData.vehicles_types_prices ?? [];

        const row = prices.find(p =>
            p.vehicle_type_id === typeId &&
            (centreId === null
            ? (p.centre_id === null || p.centre_id === undefined)
            : Number(p.centre_id) === centreId)
        );

        return row?.price ?? "";
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

                <label htmlFor="sat_unit_key" className="label">
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
                    <option value="" >Selecciona una opción</option>
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

                <label htmlFor="sat_key_prod_serv" className="label">
                    Clave de producto o servicio
                </label>
                <input
                    type="text"
                    id="sat_key_prod_serv"
                    placeholder='Clave de producto o servicio del SAT'
                    value={formData.sat_key_prod_serv || servicio.sat_key_prod_serv}
                    onChange={(e) => setFormData({...formData, sat_key_prod_serv: e.target.value})}
                />
                {errors.sat_key_prod_serv && <p className="error">{errors.sat_key_prod_serv}</p>}


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
                                    const newValue = e.target.value; // string
                                    setFormData((prev) => {
                                        const centreId =
                                        prev.centre_id === "" || prev.centre_id === undefined || prev.centre_id === null
                                            ? null
                                            : Number(prev.centre_id);

                                        const prices = prev.vehicles_types_prices ?? [];

                                        const match = (p) =>
                                        p.vehicle_type_id === type.id &&
                                        (centreId === null
                                            ? (p.centre_id === null || p.centre_id === undefined)
                                            : Number(p.centre_id) === centreId);

                                        const exists = prices.some(match);

                                        const updatedPrices = exists
                                        ? prices.map((p) =>
                                            match(p) ? { ...p, price: newValue === "" ? null : newValue } : p
                                            )
                                        : [
                                            ...prices,
                                            {
                                                vehicle_type_id: type.id,
                                                centre_id: centreId,            // 👈 CLAVE: guardar el centre actual (o null)
                                                price: newValue === "" ? null : newValue,
                                            },
                                            ];

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
