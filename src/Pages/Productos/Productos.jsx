import Modal from '@/components/Modal';
import { useState, useEffect, useContext } from 'react';
import Tabla from '@/components/Tabla';
import { AppContext } from '@/context/AppContext';
import ButtonSubmit from '@/components/UI/Buttons/ButtonSubmit';
import { toast } from 'react-toastify';
import clienteAxios from '@/config/axios';
import ErrorLabel from '@/components/UI/ErrorLabel';


export default function Productos() {
    const { productos, fetchProductos, fetchUnits, units, setLoading, requestHeader } = useContext(AppContext);

    const [modal, setModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProductos();
        fetchUnits();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.post("/api/products", formData, requestHeader);
            setModal(false);
            fetchProductos();
            toast.success("Producto creado exitosamente");
            setFormData({});
            setErrors({});
        }
        catch (error) {
            console.error("Error al crear el producto:", error);
            toast.error("Error al crear el producto");
            setErrors(error.response?.data?.errors || {});
        }
        finally {
            setLoading(false);
        }
    }

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.put(
                `/api/products/${formData.id}`,
                formData,
                requestHeader,
            );
            setModal(false);
            fetchProductos();
            toast.success("Producto actualizado exitosamente");
            setFormData({});
            setErrors({});
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            toast.error("Error al actualizar el producto");
            setErrors(error.response?.data?.errors || {});
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
    
        if (!formData.id) {
            toast.error("No se puede eliminar un producto sin ID");
            return;
        }

        setLoading(true);

        try {   
            await clienteAxios.delete(`/api/products/${formData.id}`, requestHeader);
            setModal(false);
            fetchProductos();
            toast.success("Producto eliminado exitosamente");
            setFormData({});
            setErrors({});
        }
        catch (error) {
            console.error("Error al eliminar el producto:", error);
            toast.error("Error al eliminar el producto");
        }
        finally {
            setLoading(false);
        }
    }

    const handleRowClick = (e, row) => {
        const id = row.getData().id;

        const product = productos.find((p) => p.id === id);
        if (product) {
            setFormData(product);
            setModal(true);
        }
    }

    return (
        <div>
            <h2 className="title-2">Catálogo de productos</h2>

            <div className="contenedor-botones">
                <button className="btn" onClick={() => {
                    setModal(true);
                    setFormData({});
                }}>
                    Nuevo
                </button>
            </div>

            <Modal
                isOpen={modal}
                onClose={() => {
                    setModal(false);
                }}
            >
                <form>
                    <h3 className="title-3">Nuevo producto</h3>

                    <label htmlFor="name" className="label">
                        Nombre
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="input"
                        placeholder="Nombre del producto"
                        value={formData.name || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    <ErrorLabel>{errors?.name}</ErrorLabel>

                    <label htmlFor="price" className="label">
                        Precio
                    </label>
                    <input
                        type="number"
                        id="price"
                        className="input"
                        placeholder="Precio del producto"
                        value={formData.price || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                        }
                    />
                    <ErrorLabel>{errors?.price}</ErrorLabel>

                    <label htmlFor="sat_key_prod_serv" className="label">
                        Clave de producto o servicio SAT
                    </label>
                    <input
                        type="text"
                        id="sat_key_prod_serv"
                        className="input"
                        placeholder="Clave de producto o servicio SAT"
                        value={formData.sat_key_prod_serv || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                sat_key_prod_serv: e.target.value,
                            })
                        }
                    />
                    <ErrorLabel>{errors?.sat_key_prod_serv}</ErrorLabel>

                    <label htmlFor="sat_unit_key" className="label">
                        Unidad de medida SAT
                    </label>
                    <select
                        id="sat_unit_key"
                        className="input"
                        value={formData.sat_unit_key || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                sat_unit_key: e.target.value,
                            })
                        }
                    >
                        <option value="">Seleccionar...</option>
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.key}>
                                {unit.name} {unit.key}
                            </option>
                        ))}
                    </select>
                    <ErrorLabel>{errors?.sat_unit_key}</ErrorLabel>

                    <div className="contenedor-botones">
                        {
                            formData.id ? (
                                <>
                                    <ButtonSubmit onClick={handleSubmitUpdate}>
                                        Actualizar
                                    </ButtonSubmit>
                                    <button className="btn btn-danger" onClick={handleDelete}>
                                        Eliminar
                                    </button>
                                </>
                            ) :
                            <ButtonSubmit onClick={handleSubmit}>
                                Guardar
                            </ButtonSubmit>

                        }

                    </div>
                </form>
            </Modal>

            <Tabla
                columns={[
                    {
                        title: "Nombre",
                        field: "name",
                        headerFilter: "input",
                        resizable: false,
                    },
                    {
                        title: "Precio",
                        field: "price",
                        headerFilter: "input",
                        resizable: false,
                    },
                ]}
                data={productos}
                onRowClick={handleRowClick}
            />
        </div>
    );
}
