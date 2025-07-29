export function downloadBlobResponse(response, defaultName = "archivo.pdf") {
    let fileName = defaultName;

    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (match && match[1]) {
            fileName = match[1].replace(/['"]/g, "");
        }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Limpieza del objeto URL
}
