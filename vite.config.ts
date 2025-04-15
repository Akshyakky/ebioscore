import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["@babel/plugin-transform-react-jsx", { optimize: true }]],
      },
    }),
    visualizer({
      filename: "build/stats.html",
      open: false,
      gzipSize: true,
      template: "treemap",
    }),
    viteCompression({
      verbose: false,
      algorithm: "gzip",
      ext: ".gz",
      filter: (file) => /\.(js|css|html|svg)$/.test(file),
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Remove explicit DevExtreme dedupe to avoid loading issues
    dedupe: ["react", "react-dom", "@mui/material"],
  },
  build: {
    outDir: "build",
    sourcemap: process.env.NODE_ENV !== "production",
    chunkSizeWarningLimit: 1600,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          // Core vendor chunks
          "vendor-core": ["react", "react-dom", "react-router-dom"],
          "vendor-state": ["@reduxjs/toolkit", "react-redux", "redux-persist"],

          // UI related chunks
          "vendor-mui": ["@mui/material", "@mui/icons-material", "@mui/lab", "@mui/x-date-pickers"],
          "vendor-forms": ["yup"],

          // Utility chunks
          "vendor-utils": ["axios", "date-fns", "date-fns-tz", "clsx", "lodash"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split(".").at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if (/css/i.test(extType)) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash][extname]";
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "yup",
      "axios",
      "lodash",
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@mui/x-date-pickers",
    ],
    exclude: ["@mui/icons-material/esm"],
    force: true,
    esbuildOptions: {
      target: "esnext",
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false,
    },
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
    },
  },
  cacheDir: "node_modules/.vite",
});
