import { useState } from 'react';
import { toggleInArray } from '@/utils/toggleInArray.js';

export const useSelection = (initial = []) => {
  const [selected, setSelected] = useState(initial);

  // Función para agregar/quitar items
  const toggle = (item, checkbox = null) => {
    setSelected(prev => toggleInArray(prev, item, checkbox));
    // console.log(selected);
  };

  const clear = () => setSelected([]);
  const isSelected = (item) => selected.includes(item);

  return { selected, toggle, clear, isSelected, setSelected };
};
