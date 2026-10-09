
import Tabla from '@/components/Tabla';
import { useCachedAjax } from "@/hooks/useCachedAjax";
import { AppContext } from "../../context/AppContext";
import {Link} from "react-router-dom";
import { CirclePlus } from "lucide-react";
import { useContext, useRef } from 'react';

export default function Facturas() {

    const { token, tableRef } = useContext(AppContext);
    const ajaxRequestFunc = useCachedAjax("billings", token, tableRef);
    const searchRef = useRef("");

    const handleSearch = (value) => {
        const table = tableRef.current;
        if (!table) return;

        searchRef.current = value;

        const url = `${import.meta.env.VITE_API_URL}/api/billings`;
        table.setData(url);
    };

    return (
        <div>
            <h2 className="title-2">Facturas</h2>

            <div className="contenedor-botones">
                <Link className="btn" to="/facturas/nueva">
                    <CirclePlus />
                    Nueva
                </Link>
            </div>

            <input
                type="text"
                placeholder="Búsqueda global"
                onChange={(e) => handleSearch(e.target.value)}
                className="my-2"
            />
            <Tabla
                // key={reloadKey}
                className="custom-table"
                columns={[
                    {
                        title: "Folio",
                        field: "uuid",
                    },
                    {
                        title: "Cliente",
                        field: "customer.legal_name",
                    },
                    {
                        title: "RFC",
                        field: "customer.tax_id",
                    },
                    {
                        title: "Total",
                        field: "total",
                    },
                ]}
                layout="fitColumns"
                options={{
                    // selectable: true,
                    selectablePersistence: true,
                    pagination: true, //enable pagination
                    paginationMode: "remote", //enable remote pagination
                    ajaxURL: `${import.meta.env.VITE_API_URL}/api/billings`,
                    ajaxRequestFunc,

                    ajaxParams: () => ({
                        search: searchRef.current ?? "",
                    }),
                    filterMode: "remote",
                }}
                // onRowClick={handleRowClick}
                // onSelectionChange={handleRowSelectionChanged}
            />
        </div>
    );
}
