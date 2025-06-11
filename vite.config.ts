import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { compression } from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";

  return {
    base: "./",
    server: {
      host: "::",
      port: 3000,
      open: true,
      cors: true,
    },
    plugins: [
      react().filter(Boolean),
      compression({
        algorithm: "gzip",
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: !isProduction,
      minify: isProduction ? "terser" : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug", "console.warn"],
            },
          }
        : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom"],
            "react-router": ["react-router-dom"],
            mui: ["@mui/material", "@mui/icons-material"],
            "react-query": ["@tanstack/react-query"],
            redux: ["@reduxjs/toolkit", "react-redux", "redux-persist"],
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.REACT_APP_ENV": JSON.stringify(mode),
      "process.env.DEBUG": JSON.stringify(false),
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["@vitejs/plugin-react-swc"],
    },
  };
});
