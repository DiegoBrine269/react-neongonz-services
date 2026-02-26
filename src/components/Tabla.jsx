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
    onRowClick,
    onSelectionChange,
}) {
    const [totalFilas, setTotalFilas] = useState(0);

    const [cantidadSeleccionadas, setCantidadSeleccionadas] = useState(0);


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

    const internalRowSelectionChanged = (data, rows, selected, deselected) => {
        // lógica interna de la tabla
        setCantidadSeleccionadas(data.length);

        // evento hacia el padre
        onSelectionChange?.(data, rows, selected, deselected);
    };

    const internalRowClick = (e, row) => {

        onRowClick?.(e, row);
    };


    return (
        <>
            <div className="flex justify-between items-center">
                <p className="text">
                
                    {cantidadSeleccionadas > 0  && <> Seleccionando: <span className="font-bold">{cantidadSeleccionadas}</span> de <span className="font-bold">{totalFilas}</span></>}
                    {cantidadSeleccionadas == 0 && <>Total: <span className="font-bold">{totalFilas}</span></>}
                </p>
            </div>
            <div className={className}>
                <Suspense fallback={<p>Fetching workloads...</p>}>
                    <ReactTabulator
                        onRef={(r) => (tableRef.current = r.current)}
                        data={data}
                        columns={columns}
                        persistance={true}
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

                            
                            rowSelectionChanged: internalRowSelectionChanged,
                            rowClick: internalRowClick,
                        }}
                    />
                </Suspense>
                <div className="contenedor-botones">
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
