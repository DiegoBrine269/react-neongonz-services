const tabulatorConfig = {
    // locale: true,
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



const swalConfig = () => {
    const isDark = document.querySelector("html").classList.contains("dark");
    return {
        theme: isDark ? "dark" : "light",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#dc2626",
    };
};

export {tabulatorConfig, swalConfig};