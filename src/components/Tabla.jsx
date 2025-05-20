import { useState } from "react";
import { tabulatorConfig } from "../config/variables.js"
import { ReactTabulator } from "react-tabulator";

export default function Tabla({data  , columns, options, events}) {
    const [totalFilas, setTotalFilas] = useState(0);



    return (
        <>
            <p className="text">
                Total: <span className="font-bold">{totalFilas}</span>
            </p>
            <div>
                <ReactTabulator
                    data={data}
                    columns={columns}
                    
                    // layout={"fitColumns"}
                    options={{
                        ...options,
                        ...tabulatorConfig,
                        ajaxResponse: (url, params, response) => {
                            console.log(response.total);
                            setTotalFilas(response.total);
                            return response;
                        },
                    }}
                    events={{
                        ...events,
                        dataLoaded: (data) => {
                            if (options?.paginationMode !== "remote")
                                setTotalFilas(data.length);
                        },
                        dataFiltered: (filters, rows) => {
                            if (options?.paginationMode !== "remote")
                                setTotalFilas(rows.length);
                        },
                    }}
                />
            </div>
        </>
    );
}
