import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from 'fs'

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
        // https: {
        //     key: fs.readFileSync('./cert/key.pem'),
        //     cert: fs.readFileSync('./cert/cert.pem')
        // },
        proxy: {
            "/api": {
                target: "https://vpf0g2vq-8000.usw3.devtunnels.ms/",
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
