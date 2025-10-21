import clienteAxios from "../../config/axios";
import { useState} from "react";


export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");


    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await clienteAxios.post("/api/forgot-password",
                { email }
            );
            setMessage(response.data.message);
        } catch (err) {
            setMessage(err.response.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="title-2">Restablecer contraseña</h2>
            <input
                
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <div className="contenedor-botones">
                <button type="submit" className="btn">Enviar link</button>
            </div>
            <p>{message}</p>
        </form>
    );
}
