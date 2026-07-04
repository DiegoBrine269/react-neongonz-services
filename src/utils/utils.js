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


export{
    formatearDinero,
    tabs
}