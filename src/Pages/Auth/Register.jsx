import {useState, useContext}   from 'react';
import clienteAxios from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';


export default function Register() {

    const { token, setToken, setLoading } = useContext(AppContext);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        last_name: "",
        password: "",
        password_confirmation: "",
    });

    const [errors, setErrors] = useState({});

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const {data} = await clienteAxios.post("/api/register", formData);
            
            localStorage.setItem("NEON_GONZ_TOKEN", data.token);
            setToken(data.token);
            
            navigate("/");
            
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

    return (
        <>
            <h2 className="title-2">Crear una cuenta</h2>

            <form>
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
                />
                {errors.email && (<p className="text-red-500">{errors.email[0]}</p>)}

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
                />
                {errors.name && (<p className="text-red-500">{errors.name[0]}</p>)}


                <label className="label" htmlFor="last_name">
                    Apellido
                </label>
                <input
                    className="input"
                    type="text"
                    placeholder="Apellido"
                    id="last_name"
                    onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                    }
                />
                {errors.last_name && (<p className="text-red-500">{errors.last_name[0]}</p>)}

                <label className="label" htmlFor="password">
                    Contraseña
                </label>
                <input
                    className="input"
                    type="password"
                    placeholder="Contraseña"
                    id="password"
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />
                {errors.password && (<p className="text-red-500">{errors.password[0]}</p>)}


                <label className="label" htmlFor="password_confirmation">
                    Confirma tu contraseña
                </label>
                <input
                    className="input"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    id="password_confirmation"
                    onChange={(e) =>
                        setFormData({ ...formData, password_confirmation: e.target.value })
                    }
                />


                <input
                    className="btn"
                    type="submit"
                    value="Crear cuenta"
                    onClick={handleRegister}
                />
            </form>
        </>
    );
}
