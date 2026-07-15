import { defineConfig, mergeConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

/**
 * Stubs server-only modules in the CLIENT (browser) environment.
 * Uses Vite 7's Environment API to detect the "client" build context.
 * In the SSR/Worker build, the real modules are used unchanged.
 */
const serverModuleClientStub: Plugin = {
  name: "server-module-client-stub",
  enforce: "pre",
  resolveId(id: string) {
    const envName = (this as any).environment?.name;
    // Only intercept in the browser client environment
    const isClientEnv = envName === "client";
    if (
      isClientEnv &&
      (id === "@tanstack/start-server-core" ||
        id.startsWith("@tanstack/start-server-core/"))
    ) {
      return `\0server-stub:${id}`;
    }
  },
  load(id: string) {
    if (id.startsWith("\0server-stub:")) {
      // Empty stubs — createServerFn replaces handlers with fetch() on the client,
      // so these functions are never actually called in the browser.
      return [
        "export const getRequest = () => null;",
        "export const setResponseHeader = () => {};",
        "export const getResponseHeader = () => null;",
        "export const getHeaders = () => ({});",
        "export const getCookie = () => null;",
        "export const setCookie = () => {};",
        "export const deleteCookie = () => {};",
        "export const getEvent = () => null;",
        "export const getWebRequest = () => null;",
        "export const sendRedirect = () => {};",
        "export default {};",
      ].join("\n");
    }
  },
};

/**
 * Fallback plugin (enforce: "post") that resolves TanStack Start virtual
 * module IDs not handled by tanstackStart() in some environments (Vite 7 / Windows).
 */
const tanstackVirtualFallback: Plugin = {
  name: "tanstack-start-virtual-fallback",
  enforce: "post",
  resolveId(id: string) {
    const virtualIds = [
      "tanstack-start-injected-head-scripts:v",
      "tanstack-start-manifest:v",
      "#tanstack-router-entry",
      "#tanstack-start-entry",
      "#tanstack-start-plugin-adapters",
    ];
    if (virtualIds.includes(id)) {
      return "\0virtual-tanstack:" + id;
    }
  },
  load(id: string) {
    if (id.startsWith("\0virtual-tanstack:")) {
      return [
        "export default {};",
        "export const injectedHeadScripts = undefined;",
        "export const tsrStartManifest = undefined;",
        "export const createStartHandler = undefined;",
        "export const createRequestHandler = undefined;",
      ].join("\n");
    }
  },
};

export default defineConfig(async (env) => {
  const { mode } = env;

  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return mergeConfig(
    {
      server: { host: "::", port: 8080 },
    },
    {
      define: envDefine,
      resolve: {
        alias: {
          "@": `${process.cwd()}/src`,
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      optimizeDeps: {
        exclude: [
          "@tanstack/react-start",
          "@tanstack/react-start/server-entry",
          "@tanstack/react-start/server",
          "@tanstack/react-start/client",
          "@tanstack/react-start/client-rpc",
          "@tanstack/react-start/server-rpc",
          "@tanstack/start-server-core",
          "@tanstack/start-client-core",
          "@tanstack/react-start-server",
        ],
      },
      // Mark Node built-ins and dev-only packages as external in the SSR/Worker build.
      // better-sqlite3 is dev-only and must never appear in the production server bundle.
      ssr: {
        external: [
          "better-sqlite3",
          "node:async_hooks",
          "node:stream",
          "node:stream/web",
          "node:crypto",
          "node:buffer",
          "node:path",
          "node:fs",
          "node:url",
          "node:util",
          "node:events",
        ],
      },
      plugins: [
        serverModuleClientStub,
        tanstackStart({ target: "cloudflare-pages" }),
        react(),
        tailwindcss(),
        tsconfigPaths({ projects: ["./tsconfig.json"] }),
        tanstackVirtualFallback,
      ],
    }
  );
});
