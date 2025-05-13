import { useState } from "react";
import { tabulatorConfig } from "../config/variables.js"
import { ReactTabulator } from "react-tabulator";

export default function Tabla({data, columns, options, events}) {
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
                    layout={"fitDataStretch"}
                    options={{
                        ...options,
                        ...tabulatorConfig,
                        layout: "fitDataStretch",
                    }}
                    events={{
                        ...events,
                        dataLoaded: (data) => setTotalFilas(data.length),
                        dataFiltered: (filters, rows) =>
                            setTotalFilas(rows.length),
                    }}
                />
            </div>
        </>
    );
}
