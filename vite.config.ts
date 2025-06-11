import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv, type UserConfig } from "vite";
import { compression } from "vite-plugin-compression2";

export default defineConfig(({ mode, command }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  const isBuild = command === "build";

  return {
    base: "./",

    server: {
      host: "::",
      port: 3000,
      open: true,
      cors: true,
      strictPort: false,
      hmr: {
        overlay: true,
      },
    },

    preview: {
      port: 4173,
      host: "::",
      strictPort: false,
      open: true,
    },

    plugins: [
      react(),
      ...(isProduction
        ? [
            compression({
              algorithm: "gzip",
              exclude: [/\.(br)$/, /\.(gz)$/],
              threshold: 1024,
            }),
            compression({
              algorithm: "brotliCompress",
              exclude: [/\.(br)$/, /\.(gz)$/],
              threshold: 1024,
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
        "@/services": path.resolve(__dirname, "./src/services"),
        "@/types": path.resolve(__dirname, "./src/types"),
        "@/utils": path.resolve(__dirname, "./src/utils"),
        "@/store": path.resolve(__dirname, "./src/store"),
      },
    },

    css: {
      devSourcemap: !isProduction,
      modules: {
        localsConvention: "camelCaseOnly",
      },
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: !isProduction ? "inline" : false,
      minify: isProduction ? "terser" : false,
      target: "es2020",
      cssTarget: "chrome80",

      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug", "console.warn"],
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          }
        : {},

      rollupOptions: {
        output: {
          manualChunks: {
            "react-core": ["react", "react-dom"],
            "react-router": ["react-router-dom"],
            "ui-framework": ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
            "data-management": ["@tanstack/react-query", "@reduxjs/toolkit", "react-redux", "redux-persist"],
            utils: ["axios", "dayjs", "crypto-js", "clsx"],
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split("/").pop() : "chunk";
            return `assets/js/[name]-[hash].js`;
          },
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split(".") || [];
            const ext = info[info.length - 1];
            if (ext && /png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash].[ext]`;
            }
            if (ext && /css/i.test(ext)) {
              return `assets/css/[name]-[hash].[ext]`;
            }
            return `assets/[ext]/[name]-[hash].[ext]`;
          },
        },
        external: (id) => {
          // Don't bundle these in development
          return !isBuild && ["react-devtools"].includes(id);
        },
      },

      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },

    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __DEV__: JSON.stringify(!isProduction),
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.REACT_APP_ENV": JSON.stringify(mode),
      "process.env.DEBUG": JSON.stringify(!isProduction),
    },

    optimizeDeps: {
      include: ["react", "react-dom", "@mui/material", "@emotion/react", "@emotion/styled", "react-router-dom", "@tanstack/react-query"],
      exclude: ["@vitejs/plugin-react-swc"],
      esbuildOptions: {
        target: "es2020",
      },
    },

    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      target: "es2020",
      drop: isProduction ? ["console", "debugger"] : [],
    },
  };
});
