import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";

// Client: hydrateRoot + createBrowserRouter + RouterProvider (pola
// React Router v7 framework-less / "data mode" SSR).
//
// AKAR BUG SEBELUMNYA (terbukti dari source react-router 7.18.5 terinstal):
// entry.client lama memakai <HydratedRouter /> dari "react-router/dom".
// HydratedRouter adalah komponen FRAMEWORK-MODE — createHydratedRouter()
// (node_modules/react-router/dist/production/dom-export.mjs) menuntut
// window.__reactRouterContext + window.__reactRouterManifest +
// window.__reactRouterRouteModules (yang hanya disiapkan ServerRouter
// framework-mode). Server varian B memakai pola framework-less
// (createStaticHandler + createStaticRouter + StaticRouterProvider) yang
// hanya menyisipkan window.__staticRouterHydrationData — jadi ssrInfo
// tetap null dan HydratedRouter melempar:
// "You must be using the SSR features of React Router in order to skip
// passing a 'router' prop to '<RouterProvider>'", lalu React meng-unmount
// seluruh konten SSR (#root kosong).
//
// Konsumen window.__staticRouterHydrationData yang benar adalah
// createBrowserRouter (via parseHydrationData() di chunk-7RTFRKQW.mjs):
// ia membaca data itu — termasuk deserialisasi errors — bila opts
// .hydrationData tidak diisi. Karena itu di sini TIDAK di-pass
// hydrationData eksplisit: mem-pass window.__staticRouterHydrationData
// mentah akan melewati deserialisasi errors tersebut. Server
// (entry.server.tsx) TIDAK berubah: StaticRouterProvider sudah menyisipkan
// script data tersebut sebelum client.js dieksekusi.
const router = createBrowserRouter(routes);

const root = document.getElementById("root");
if (!root) {
  throw new Error("Elemen #root tidak ditemukan — halaman tidak bisa di-hydrate.");
}

hydrateRoot(
  root,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
