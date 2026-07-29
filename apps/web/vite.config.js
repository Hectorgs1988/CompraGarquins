import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg"],
            manifest: {
                name: "CestaGarquins",
                short_name: "Cesta",
                description: "Lista de la compra inteligente con NFC y recetas",
                theme_color: "#134e4a",
                background_color: "#ecfeff",
                display: "standalone",
                start_url: "/",
                icons: [
                    {
                        src: "/icon.svg",
                        sizes: "512x512",
                        type: "image/svg+xml"
                    },
                    {
                        src: "/icon.svg",
                        sizes: "512x512",
                        type: "image/svg+xml",
                        purpose: "any maskable"
                    }
                ]
            }
        })
    ]
});
