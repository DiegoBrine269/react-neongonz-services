import { useState } from 'react';
import { toggleInArray } from '@/utils/toggleInArray.js';

export const useSelection = (initial = []) => {
    const [selected, setSelected] = useState(initial);
    const [checkedMap, setCheckedMap] = useState({});

    // Función para agregar/quitar items
    const toggle = (item, checkbox = null) => {
        setSelected(prev => toggleInArray(prev, item, checkbox));
    };

    const clear = () => setSelected([]);
    const isSelected = (item) => selected.includes(item);

    // Seleccionar todos (recibe lista de items)
    const selectAll = (items) => {
        setSelected(items);
    };

    // Alternar selección total: si ya están todos, limpia; si no, selecciona todos
    const toggleAll = (items) => {
        if (items.length === selected.length) {
            clear();
        } else {
            selectAll(items);
        }
    };

    // Funciona para los checkbox de proyectos
    const handleCheckboxChange =
        (name, items, getKey) =>
        (e) => {
            console.log("handleCheckboxChange", name, e.target.checked);
            debugger
            const { checked } = e.target;

            setCheckedMap((prev) => ({ ...prev, [name]: checked }));

            const numericName = parseInt(name, 10);

            items.forEach((item) => {
                if (getKey(item) === numericName) {
                    toggle(item, checked);
                }
            });
        };


    return { 
        selected, 
        toggle, 
        clear, 
        isSelected, 
        setSelected, 
        selectAll, 
        toggleAll,
        handleCheckboxChange,
        checkedMap,
        setCheckedMap,
    };
};
