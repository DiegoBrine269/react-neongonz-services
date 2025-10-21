import {
    Trash2,
    ClipboardCheck,
    PackageOpen,
    Copy,
} from "lucide-react";

export default function ProyectoActions({
    proyecto,
    user,
    handleToggleStatusProyecto,
    handleDuplicarProyecto,
    handleEliminarProyecto,
}) {
    return (
        <>
            {user?.role === "admin" && (
                <div className="contenedor-botones">
                    <button
                        className="btn btn-secondary mt-0"
                        onClick={handleToggleStatusProyecto}
                        >
                        {proyecto?.is_open ? (
                            <ClipboardCheck />
                        ) : (
                            <PackageOpen />
                        )}
                        {proyecto?.is_open ? "Cerrar" : "Abrir"}
                    </button>

                    <button
                        className="btn bg-green-600 mt-0"
                        onClick={handleDuplicarProyecto}
                        >
                        <Copy /> Duplicar
                    </button>

                    <button
                        className="btn btn-danger mt-0"
                        onClick={handleEliminarProyecto}
                        >
                        <Trash2 /> Eliminar
                    </button>
                </div>
            )}
        </>
    );
}
