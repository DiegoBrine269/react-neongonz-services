export const extractErrorMessages = (error) => {
    const data = error.response?.data;
    if (!data) return ["Ocurrió un error inesperado"];

    // Caso: { errors: { error: [...] } } o { errors: { campo: [...] } }
    if (data.errors) {
        return Object.values(data.errors).flat();
    }
    if (data.message) return [data.message];
    return ["Ocurrió un error inesperado"];
};
