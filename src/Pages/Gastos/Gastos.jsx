import {CirclePlus, ListOrdered} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Gastos() {
    return (
        <>
            <h2 className="title-2">Gastos</h2>

            <div className="contenedor-botones">
                <Link className="btn" to="/gastos/nuevo">
                    <CirclePlus />
                    Nuevo
                </Link>

                <Link className="btn btn-secondary" to="/gastos/categorias">
                    <ListOrdered/>
                    Categorías
                </Link>
            </div>
        </>
    );
}
