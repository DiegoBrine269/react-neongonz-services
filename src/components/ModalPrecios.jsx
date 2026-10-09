// components/cotizacion/ModalPrecios.jsx
import Modal from "@/components/Modal";
import { formatearDinero } from "@/utils/utils";


const cellClass = "border dark:border-neutral-600 p-2";

export default function ModalPrecios({
    isOpen,
    onClose,
    precios = [],
    onSelect,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="title-3">Selecciona un precio</h2>

            <table className="text border dark:border-neutral-600">
                <tbody>
                    {precios.map((precio) => (
                        <tr
                            key={
                                precio.id ??
                                `${precio.vehicle_type.type}-${precio.price}`
                            }
                        >
                            <td className={cellClass}>
                                {formatearDinero(precio.price)}
                            </td>
                            <td className={cellClass}>
                                {precio.vehicle_type.type}
                            </td>
                            <td className={cellClass}>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => onSelect(precio)}
                                >
                                    Seleccionar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Modal>
    );
}
