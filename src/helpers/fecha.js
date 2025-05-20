export function convertirFechaADash(fecha) {
    const [dia, mes, anio] = fecha.split("/");
    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}
