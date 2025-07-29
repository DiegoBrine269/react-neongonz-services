const tabulatorConfig = {
    // locale: true,
    // resizableRows: true,
    placeholder: "Sin resultados",
    layout: "fitDataFill",
    resizableColumns: false,
    langs: {
        default: {
            pagination: {
                first: "Primero",
                first_title: "Primera página",
                last: "Último",
                last_title: "Última página",
                prev: "Anterior",
                prev_title: "Página anterior",
                next: "Siguiente",
                next_title: "Página siguiente",
            },
            ajax: {
                loading: "Cargando datos...", // Cambia "Loading..."
                error: "Error al cargar", // También puedes cambiar "Error loading data"
            },
        },
    },
};



const swalConfig = (danger = false) => {
    const isDark = document.querySelector("html").classList.contains("dark");

    const dangerColors = {
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#2563eb",
    };

    const defaultColors = {
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#dc2626",
    };

    return {
        theme: isDark ? "dark" : "light",
        confirmButtonColor: danger ? dangerColors.confirmButtonColor : defaultColors.confirmButtonColor,
        cancelButtonColor: danger ? dangerColors.cancelButtonColor : defaultColors.cancelButtonColor,
    };
};

const formatoMoneda = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
});

export {tabulatorConfig, swalConfig, formatoMoneda};