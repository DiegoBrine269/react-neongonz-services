function formatearDinero(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(valor);
}

const tabs = [
    { id: 'todas', label: 'Todas' },
    { id: 'envio', label: 'Para envío'},
    { id: 'oc', label: 'Para OC' },
    { id: 'factura', label: 'Para factura' },
    { id: 'f', label: 'Para F' },
    { id: 'complemento', label: 'Para complemento' },
    { id: 'finalizada', label: 'Finalizadas' },
];

// utils/parseBlobError.js
async function getResponseErrors(error) {
    const data = error.response?.data;

    if (data instanceof Blob) {
        try {
            return JSON.parse(await data.text());
        } catch {
            return null;
        }
    }
    return data ?? null;
}


export { formatearDinero, tabs, getResponseErrors };