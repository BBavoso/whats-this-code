import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                background: "background.ts",
                popup: "popup.html",
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === "background") return "background.js";
                    return chunk.name + ".js";
                },
            },
        },
        outDir: "dist",
        sourcemap: false,
        emptyOutDir: true,
    },
});
