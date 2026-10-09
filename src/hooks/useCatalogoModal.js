// hooks/useCatalogoModal.js
import { useState, useCallback } from "react";

export function useCatalogoModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [tipo, setTipo] = useState("productos");
    const [index, setIndex] = useState(null);

    const open = useCallback((itemIndex, tipoCatalogo) => {
        setIndex(itemIndex);
        setTipo(tipoCatalogo);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    return { isOpen, tipo, index, open, close };
}
