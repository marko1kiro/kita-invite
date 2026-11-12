import { useEffect, useState } from "react";

type Health = {
  status: "ok";
  environment: string;
};

type ConnectionState = "checking" | "ready" | "unavailable";

function isHealth(value: unknown): value is Health {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return candidate.status === "ok" && typeof candidate.environment === "string";
}

export default function App() {
  const [connection, setConnection] = useState<ConnectionState>("checking");
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function checkHealth() {
      try {
        const response = await fetch("/api/v1/health", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Health endpoint unavailable");

        const payload: unknown = await response.json();
        if (!isHealth(payload)) throw new Error("Unexpected health response");
        setHealth(payload);
        setConnection("ready");
      } catch {
        if (!controller.signal.aborted) setConnection("unavailable");
      }
    }

    void checkHealth();
    return () => controller.abort();
  }, []);

  const statusCopy: Record<ConnectionState, string> = {
    checking: "Memeriksa koneksi API…",
    ready: "Worker merespons pemeriksaan kesehatan.",
    unavailable: "API belum terhubung. Jalankan Worker lokal untuk memeriksa endpoint.",
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Kita Invite · Fase 1</p>
        <h1>Fondasi aplikasi</h1>
        <p className="intro">
          Halaman teknis untuk memeriksa scaffold frontend dan Worker. Fitur produk belum termasuk dalam fase ini.
        </p>
      </header>

      <section className="status-section" aria-labelledby="status-heading">
        <p className="section-kicker">Pemeriksaan lokal</p>
        <h2 id="status-heading">Status layanan</h2>
        <p className="status-copy" data-state={connection} role="status" aria-live="polite">
          {statusCopy[connection]}
        </p>
        <dl className="status-details">
          <div>
            <dt>Worker</dt>
            <dd>{connection === "ready" ? "Aktif" : connection === "checking" ? "Memeriksa" : "Belum tersambung"}</dd>
          </div>
          <div>
            <dt>Environment</dt>
            <dd>{health?.environment ?? "Belum diketahui"}</dd>
          </div>
        </dl>
      </section>

      <footer className="page-footer">
        Fondasi dev/staging · Tidak memuat data tamu atau alur undangan.
      </footer>
    </main>
  );
}
