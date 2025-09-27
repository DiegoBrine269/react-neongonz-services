import { useState } from 'react';
import { toggleInArray } from '@/utils/toggleInArray.js';

export const useSelection = (initial = []) => {
  const [selected, setSelected] = useState(initial);

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

    return { 
        selected, 
        toggle, 
        clear, 
        isSelected, 
        setSelected, 
        selectAll, 
        toggleAll 
    };
};
