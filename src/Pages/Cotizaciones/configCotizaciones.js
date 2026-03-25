import { formatoMoneda } from "@/config/variables";
import { format } from "@formkit/tempo";

const columnasCotizaciones =
[
                        {
                            title: "",
                            formatter: "rowSelection",
                            titleFormatter: "rowSelection", // opcional: checkbox en el header para seleccionar todos
                            hozAlign: "center",
                            headerSort: false,
                            width: 50,
                            resizable: false,
                        },
                        {
                            title: "Centro",
                            field: "centre",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "Monto total",
                            field: "total",
                            headerFilter: "number",
                            headerFilterFunc: "=",
                            formatter: (cell) => {
                                return cell.getValue() ? formatoMoneda.format(parseInt(cell.getValue())): null;
                            },
                            hozAlign: "right",
                            resizable: false,
                        },
                        {
                            title: "Fecha de cotización",
                            field: "date",
                            headerFilter: true,
                            headerFilterParams: {
                                elementAttributes: {
                                    type: "date",
                                },
                            },
                            resizable: false,
                            formatter: (cell) => {
                                const date = new Date(
                                    cell.getValue() + "T12:00:00"
                                );

                                return format(date, "DD/MM/YYYY");
                            },
                        },
                        {
                            title: "Fecha de validación",
                            field: "validation_date",
                            headerFilter: true,
                            headerFilterParams: {
                                elementAttributes: {
                                    type: "date",
                                },
                            },
                            resizable: false,
                            formatter: (cell) => {
                                if (!cell.getValue()) return "";
                                const date = new Date(
                                    cell.getValue() + "T12:00:00"
                                );

                                return format(date, "DD/MM/YYYY");
                            },
                        },
                        {
                            title: "Servicios",
                            field: "services",
                            headerFilter: true,
                            resizable: false,
                            width: 220,
                        },
                        {
                            title: "Número",
                            field: "invoice_number",
                            headerFilter: true,
                            resizable: false,
                        },

                        {
                            title: "OC",
                            field: "oc",
                            headerFilter: true,
                            resizable: false,
                        },

                        {
                            title: "Folio fiscal",
                            field: "uuid",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "Forma de pago",
                            field: "payment_form",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "Método de pago",
                            field: "payment_method",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "F",
                            field: "f_receipt",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "Comentarios internos",
                            field: "internal_commentary",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "Status",
                            field: "status",
                            headerFilter: true,
                            resizable: false,
                        },
                        {
                            title: "UUID",
                            field: "billing.uuid",
                            headerFilter: true,
                            resizable: false,
                            // visible: false,
                        },
                    ];

export {columnasCotizaciones};