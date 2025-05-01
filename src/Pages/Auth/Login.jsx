import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import clienteAxios from "../../config/axios";
import { Link } from "react-router-dom";

export default function Login() {
    const { setToken, setLoading } = useContext(AppContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await clienteAxios.post("/api/login", formData);
            localStorage.setItem("NEON_GONZ_TOKEN", data.token);
            setToken(data.token);
            setLoading(false);

            navigate("/");
        } catch (error) {
            setLoading(false);
            console.error("Error during request:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        }
    }

    return (
        <>
            <h2 className="title-2">Iniciar Sesión</h2>

            <form action="">
                <label className="label" htmlFor="correo">
                    Correo
                </label>
                <input
                    className="input"
                    type="email"
                    id="correo"
                    placeholder="Correo electrónico"
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />
                {errors.email && (
                    <p className="text-red-500">{errors.email[0]}</p>
                )}

                <label className="label" htmlFor="password">
                    Contraseña
                </label>
                <input
                    className="input"
                    type="password"
                    id="password"
                    placeholder="Contraseña"
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />
                {errors.password && (
                    <p className="text-red-500">{errors.password[0]}</p>
                )}

                <input
                    className="btn"
                    type="submit"
                    value="Iniciar sesión"
                    onClick={handleLogin}
                />

                <Link className="text-end block text-blue-500 underline" to="/olvide-mi-contrasena">Olvidé mi contraseña 😬</Link>
            </form>
        </>
    );
}
