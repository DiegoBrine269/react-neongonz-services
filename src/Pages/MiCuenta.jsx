import { AppContext } from "../context/AppContext";
import { useContext, useState } from "react";
import Modal from "../components/Modal";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";
import { Pencil, KeyRound } from "lucide-react";

export default function MiCuenta() {

    const { token, setLoading, user, setUser } = useContext(AppContext);
    const [errors, setErrors] = useState([]);
    const [modalDatos, setModalDatos] = useState(false);
    const [modalPass, setModalPass] = useState(false);


    const [formData, setFormData] = useState({
        name: user?.name,
        last_name: user?.last_name,
        email: user?.email,
        current_password: '',
        new_password:'',
        new_password_confirmation : '',
    });

    const handleActualizarDatos = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const {data} = await clienteAxios.put(`/api/user/${user.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });



            // console.log(data.user)           
            setUser(data.user)
            setModalDatos(false);
            toast.success("Datos actualizados correctamente");
        } catch (error) {
            console.error("Error during registration:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
        finally{
            setLoading(false);
        }
    }

    const handleActualizarPass = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await clienteAxios.put(`/api/user/change-password`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
 
            setUser(data.user)
            setModalPass(false);
            toast.success("Contraseña actualizada correctamente");
        } catch (error) {
            console.error("Error during registration:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
            toast.error("Ha habido un error.");
        }
        finally{
            setLoading(false);
        }
    }
    

    return (
        <>
            <h2 className="title-2 mb-0">Mi cuenta</h2>

            <div className="pl-3">
                <p className="text">
                    <span className="font-bold">Nombre:</span> {user?.name}
                </p>
                <p className="text">
                    <span className="font-bold">Apellido:</span>{" "}
                    {user?.last_name}
                </p>
                <p className="text">
                    <span className="font-bold">Correo:</span> {user?.email}
                </p>
            </div>

            <div className="mt-4">
                <button
                    className="btn mt-0"
                    onClick={() => {
                        setModalDatos(true);
                    }}
                >
                    <Pencil/>
                    Modificar datos
                </button>

                <button
                    className="btn btn-danger mt-0"
                    onClick={() => {
                        setModalPass(true);
                    }}
                >
                    <KeyRound/>
                    Cambiar contraseña
                </button>
            </div>

            <Modal isOpen={modalDatos} onClose={() => setModalDatos(false)}>
                <form>
                    <h3 className="title-3">Actualiza tus datos</h3>
                    <label className="label" htmlFor="correo">
                        Correo
                    </label>
                    <input
                        className="input"
                        type="email"
                        placeholder="Correo electrónico"
                        id="correo"
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        value={formData.email}
                    />
                    {errors.email && (
                        <p className="text-red-500">{errors.email[0]}</p>
                    )}

                    <label className="label" htmlFor="name">
                        Nombre
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Nombre"
                        id="name"
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        value={formData.name}
                    />
                    {errors.name && (
                        <p className="text-red-500">{errors.name[0]}</p>
                    )}

                    <label className="label" htmlFor="last_name">
                        Apellido
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Apellido"
                        id="last_name"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                last_name: e.target.value,
                            })
                        }
                        value={formData.last_name}
                    />
                    {errors.last_name && (
                        <p className="text-red-500">{errors.last_name[0]}</p>
                    )}

                    <input
                        className="btn"
                        type="submit"
                        value="Actualizar"
                        onClick={handleActualizarDatos}
                    />
                </form>
            </Modal>

            <Modal isOpen={modalPass} onClose={() => setModalPass(false)}>
                <form>
                    <h3 className="title-3">Actualiza tu contraseña</h3>
                    <label className="label" htmlFor="current_password">
                        Contraseña actual
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder="Contraseña actual"
                        id="current_password"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                current_password: e.target.value,
                            })
                        }
                        value={formData.current_password}
                    />
                    {errors.current_password && (
                        <p className="error">{errors.current_password[0]}</p>
                    )}

                    <label className="label" htmlFor="new_password">
                        Contraseña nueva
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder="Contraseña nueva"
                        id="new_password"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                new_password: e.target.value,
                            })
                        }
                        value={formData.new_password}
                    />
                    {errors.new_password && (
                        <p className="error">{errors.new_password[0]}</p>
                    )}

                    <label
                        className="label"
                        htmlFor="new_password_confirmation"
                    >
                        Confirma tu nueva contraseña
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        id="new_password_confirmation"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                new_password_confirmation: e.target.value,
                            })
                        }
                        value={formData.new_password_confirmation}
                    />

                    <input
                        className="btn"
                        type="submit"
                        value="Actualizar"
                        onClick={handleActualizarPass}
                    />
                </form>
            </Modal>
        </>
    );
}
