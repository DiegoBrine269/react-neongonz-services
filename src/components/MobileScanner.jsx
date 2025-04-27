import React, { useState } from "react";
import Tesseract from "tesseract.js";

const MobileScanner = ({ onDetect }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            // const image = URL.createObjectURL(file);
            const preprocessedImage = await preprocessImage(file);

            const result = await Tesseract.recognize(preprocessedImage, "spa", {
                tessedit_char_whitelist: "0123456789", // Solo números
                psm: 7, // Modo de segmentación
            });
            const text = result.data.text ?? null;

            // const match = text.match(/\b\d{5}\b/);
            onDetect(text);

        } catch (err) {
            console.error("Error OCR:", err);
            setError("Error al procesar la imagen.");
        } finally {
            setLoading(false);
        }
    };

const preprocessImage = (file) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Reducir la resolución
            const maxWidth = 800; // Ajusta según sea necesario
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
        };
    });
};

    return (
        <div className="p-4 flex flex-col gap-4 items-center">
            <label className="label">
                Tomar foto
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="btn-secondary"
                />
            </label>

            {loading && <p className="text-gray-600">Procesando imagen...</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default MobileScanner;
