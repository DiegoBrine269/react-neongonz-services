import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"), // 👈 Esto crea el alias @ hacia /src
        },
    },
    server: {
        host: true,
        proxy: {
            "/api": {
                target: "http://192.168.0.11:8000",
                changeOrigin: true,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            },
        },
    },
    // theme: {
    //     extend: {
    //         colors: {
    //             dark: {
    //                 background: "#1A1A1A",
    //                 text: "#F0F0F0",
    //                 accent1: "#004D61",
    //                 accent2: "#822659",
    //                 button: "#3E5641",
    //             },
    //         },
    //     },
    // },
});
