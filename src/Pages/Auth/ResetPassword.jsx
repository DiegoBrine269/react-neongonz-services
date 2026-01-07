import clienteAxios from "../../config/axios";
import { use, useEffect, useState} from "react";
import ErrorLabel from '@/components/UI/ErrorLabel';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


export default function ForgotPassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        password_confirmation: "",

    })
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});


    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    // setFormData({ ...formData, token: token, email: email });

    useEffect(() => {
        setFormData({ ...formData, token: token, email: email });
    }, [token, email]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await clienteAxios.post("/api/reset-password",
                formData
            );
            setMessage(response.data.message);

            if(response.status === 200){
                setFormData({
                    password: "",
                    password_confirmation: "",
                });
                setErrors({});

                toast.success("Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.");
                navigate("/login");
            }

            
        } catch (err) {
            setErrors(err.response.data.errors || {});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="title-2">Ingresa tu nueva contraseña</h2>

            <label className="label" htmlFor="password">Nueva contraseña</label>
            <input
                type="password"
                id="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
            />
            <ErrorLabel>{errors.password}</ErrorLabel>

            <label className="label" htmlFor="password_confirmation">Nueva contraseña</label>
            <input
                type="password"
                id="password_confirmation"
                placeholder="Contraseña"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                required
            />
            <ErrorLabel>{errors.password_confirmation}</ErrorLabel>

            <ErrorLabel>{errors.message}</ErrorLabel>

            <div className="contenedor-botones">
                <button type="submit" className="btn">Actualizar</button>
            </div>
            
        </form>
    );
}