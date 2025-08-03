function formatearDinero(valor) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(valor);
}


export{
    formatearDinero
}