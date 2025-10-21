import { useState, useRef, Suspense, useContext, useEffect } from "react";
import { tabulatorConfig } from "../config/variables.js";
import { ReactTabulator } from "react-tabulator";
import { Sheet, FileText } from "lucide-react";
import { AppContext } from "@/context/AppContext.jsx";
import * as XLSX from "xlsx";
// import { FontAwesomeIcon } from '@fortawesome/fontawesome-svg-core'
// import jsPDF from "jspdf";
// import "jspdf-autotable";

export default function Tabla({
    className,
    title,
    data,
    columns,
    options,
    events,
}) {
    const [totalFilas, setTotalFilas] = useState(0);

    // let tableRef = useRef(null);
    const { tableRef } = useContext(AppContext);

    useEffect(() => {
        // Tabulator lo espera en el objeto global
        window.XLSX = XLSX;
        if (typeof window !== "undefined") {
            window.jsPDF = window.jspdf.jsPDF;
        }
    }, []);

    const downloadExcel = () => {
        tableRef.current.download("xlsx", `${title || "Reporte"}.xlsx`, {
            sheetName: "Reporte",
        });
    };

    const downloadPdf = () => {
        tableRef.current.download("pdf", `${title || "Reporte"}.pdf`, {
            orientation: "landscape", //set page orientation to portrait
            title: title || "Reporte", //add title to report
        });
    };

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
                <Suspense fallback={<p>Fetching workloads...</p>}>
                    <ReactTabulator
                        onRef={(r) => (tableRef.current = r.current)}
                        data={data}
                        columns={columns}
                        // onRef={(r) => (tableRef = r)}
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
                            // tableBuilt: (tabulator) => {
                            //     tableRef.current = tabulator;
                            // },
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
                </Suspense>
                <div className="flex justify-end gap-2 mt-2">
                    <button
                        className="btn bg-orange-900 w-fit"
                        onClick={() => downloadPdf()}
                    >
                        <FileText />
                        Descargar (pdf)
                    </button>
                    <button
                        className="btn bg-green-700 w-fit"
                        onClick={() => downloadExcel()}
                    >
                        <Sheet />
                        Descargar (excel)
                    </button>
                </div>
            </div>
        </>
    );
}
