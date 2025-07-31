import { format } from "@formkit/tempo";

export default function ProyectoInfo({proyecto}) {
    return (
        <div className="pl-3">
            <p className="text">
                <span className="font-bold">Servicio:</span>{" "}
                {proyecto?.service?.name}
            </p>
            <p className="text">
                <span className="font-bold">Centro de ventas:</span>{" "}
                {proyecto?.centre?.name}{" "}
            </p>
            <p className="text">
                <span className="font-bold">Fecha:</span>{" "}
                {format(proyecto?.date, "full", "es")}
            </p>
            <p className="text">
                <span className="font-bold">Comentario:</span>{" "}
                {proyecto?.commentary}{" "}
            </p>
        </div>
    );
}
