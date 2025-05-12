
import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";


export default function Cotizaciones() {


    return (
        <>
            <h2 className="title-2">Cotizaciones</h2>

            <Link
                className="btn mb-4"
                to="/cotizaciones/nueva"
            >
                <CirclePlus />
                Nueva
            </Link>
        </>
    );
}
