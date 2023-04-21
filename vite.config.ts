import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                assetFileNames: "[name].[hash:6].[ext]",
                entryFileNames: "[name].[hash:6].js",
                chunkFileNames: "[name].[hash:6].[ext]",
            },
        },
        manifest: true,
        minify: "terser",
        terserOptions: {
            /**
             * Argument - it can be said that pro reverse engineers can easily r-e the code with or without mangling,
             * and under this context mangling only causes pain to maintainers that cannot dicipher errors reported-back
             * by analytics. It's up to each other's understanding of who they are dealing with
             */
            mangle: true,
            compress: {
                // Note: never present information through console in production build, it provides little to no security and can be used as breakpoints to access codes
                drop_console: true,
                global_defs: {
                    // Do some conditional compilation here
                },
                // I generally think 2 passes are just enough. More is just a waste of performance and could become unsafe
                passes: 2,
            },
        },
        // Note: never present a way to better access the underlying code logic in production build
        sourcemap: false,
    },
});
