
import { useState } from "react";
import { tabulatorConfig } from "../config/variables.js"
import { ReactTabulator } from "react-tabulator";
import { Download } from "lucide-react";

export default function Tabla({className, data, columns, options, events}) {
    const [totalFilas, setTotalFilas] = useState(0);



    return (
        <>
            <div className="flex justify-between items-center">
                <p className="text">
                    Total: <span className="font-bold">{totalFilas}</span>
                </p>

                {/* <button className="btn bg-green-800 max-w-35">
                    <Download/>
                    Descargar
                </button> */}
            </div>
            <div className={className}>
                <ReactTabulator
                    data={data}
                    columns={columns}
                    
                    // layout={"fitColumns"}
                    options={{
                        ...options,
                        ...tabulatorConfig,
                        
                        ajaxResponse: (url, params, response) => {
                            // console.log(response.total);
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
