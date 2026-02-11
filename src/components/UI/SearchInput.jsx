import { useState, useRef, useContext, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import Fuse from "fuse.js";
import ErrorLabel from "./ErrorLabel";

export default function SearchInput({htmlId, initialValue, lista, placeholder, onSelectItem, error }) {

    const  inputBuscarServicioRef  = useRef(null);

    const [displayValue, setDisplayValue] = useState("");

    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [listaFiltrada, setListaFiltrada] = useState(lista);

    useEffect(() => {
        console.log("Initial value effect:", initialValue);
        if (initialValue) {
            const item = lista.find((item) => item.id.toString() === initialValue.toString());
            if (item) {
                setDisplayValue(item.name);
            }
        }
    }, []);

    useEffect(() => {
        setListaFiltrada(lista);
    }, [lista]);


    const handleSelectLista = ()=> {
        flushSync(() => setMostrarSugerencias(true));
        inputBuscarServicioRef?.current.focus();
    };

    const handleItemClick = (e)=> {
        // Estos valores siempre serán calculados en el hijo
        const itemId = e.currentTarget.getAttribute("value");
        const itemName = e.currentTarget.textContent;

        setDisplayValue(itemName);

        onSelectItem(itemId, itemName);

        setMostrarSugerencias(false);
    };


    const handleFiltrarLista = (e)=> {
        const q = normalize(e.target.value.trim());
        if (!q) return setListaFiltrada(lista);
        const res = fuse.search(q).map((r) => r.item);
        setListaFiltrada(res);
    };

    const normalize = (s) =>  s
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") || "";
    
    // Fuse minimal: usa el mismo campo, pero normalizado por getFn
    const fuse = useMemo(
        () =>
        new Fuse(lista, {
            keys: ["name"],
            threshold: 0.3,
            ignoreLocation: true,
            minMatchCharLength: 1,
            getFn: (obj) => normalize(obj.name), // 👈 normaliza solo aquí
        }),
        [lista]
    );



    return (
        <div className="relative">
            <input type="text" name="" id={htmlId} autoComplete="false" placeholder={placeholder} readOnly onClick={handleSelectLista} value={displayValue ?? ""}/>
            {<ErrorLabel>{error}</ErrorLabel>}
            {/* Sugerencias */}
            {<div className={`${!mostrarSugerencias && 'hidden'} max-w-full rounded-md cursor-pointer p-3 bg-white dark:bg-neutral-800 w-full top-full border shadow-2xl`}>
                

                <input ref={inputBuscarServicioRef} type="text" className="input sticky top-0" placeholder="Buscar" onChange={handleFiltrarLista}/>

                <div className="overflow-scroll max-h-40 h-auto">
                    {listaFiltrada.map((item) => (
                        <div 
                            key={item.id} 
                            value={item.id} 
                            className="text px-2 py-1 border-b-1 cursor-pointer hover:dark:bg-neutral-800 hover:bg-gray-200"
                            onClick={handleItemClick}
                        >
                            {item.name}
                        </div>
                    ))}

                </div>
            </div>}
        </div>
    )
}
