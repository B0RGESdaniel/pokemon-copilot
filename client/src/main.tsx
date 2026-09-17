import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Reopening the PWA after it's been fully closed always refetches over the
// network — the Fly.io API scales to zero when idle, so that first request
// after a while can take several seconds. Persisting the cache means the
// last-known saves/party/pc render instantly while that refetch happens
// quietly in the background, instead of blocking on a loading screen.
const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: ONE_WEEK,
    },
  },
});

const persister = createSyncStoragePersister({ storage: window.localStorage });

createRoot(rootElement).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: ONE_WEEK, buster: "v1" }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
