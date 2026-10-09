// components/cotizacion/ModalCatalogo.jsx
import Modal from "@/components/Modal";
import SearchInput from "@/components/UI/SearchInput";



export default function ModalCatalogo({ isOpen, onClose, tipo, items = [], onSelect }) {
    const CONFIG = {
        servicios: {
            titulo: "Catálogo de Servicios",
            placeholder: "Buscar servicio",
        },
        productos: {
            titulo: "Catálogo de Productos",
            placeholder: "Buscar producto",
        },
    };

    const { titulo, placeholder } = CONFIG[tipo] ?? CONFIG.productos;

    

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="title-3">{titulo}</h2>

            <SearchInput
                id={`search-${tipo}`}
                placeholder={placeholder}
                lista={items}
                onSelectItem={onSelect}
            />
        </Modal>
    );
}
