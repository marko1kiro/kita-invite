import { useEffect, useState } from "react";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
  type LoaderFunctionArgs,
  type RouteObject,
} from "react-router";
import { getInvitation, invitations, type Invitation } from "./data";

// ---------------------------------------------------------------------------
// Route didefinisikan SEKALI di sini; dipakai server (createStaticHandler)
// dan client (HydratedRouter).
// ---------------------------------------------------------------------------

function invitationLoader({ params }: LoaderFunctionArgs): Invitation {
  const inv = getInvitation(params.slug);
  if (!inv) {
    throw new Response("Undangan tidak ditemukan", { status: 404 });
  }
  return inv;
}

function apiInvitationLoader({ params }: LoaderFunctionArgs): Response {
  const inv = getInvitation(params.slug);
  if (!inv) {
    return Response.json({ error: "invitation not found" }, { status: 404 });
  }
  return Response.json(inv);
}

export const routes: RouteObject[] = [
  {
    id: "index",
    path: "/",
    element: <IndexPage />,
  },
  {
    id: "invitation",
    path: "/:slug",
    loader: invitationLoader,
    element: <InvitationPage />,
    errorElement: <NotFoundPage />,
  },
  // Route loader-only: mendokumentasikan endpoint API di definisi route
  // tunggal. CATATAN: StaticHandler.query() tidak meneruskan Response loader
  // untuk document request, jadi worker.ts melayani /api/invitation/:slug
  // langsung sebelum router (memakai getInvitation yang sama).
  {
    id: "api-invitation",
    path: "/api/invitation/:slug",
    loader: apiInvitationLoader,
  },
];

// ---------------------------------------------------------------------------
// Halaman index
// ---------------------------------------------------------------------------

function IndexPage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="hero__eyebrow">Kita Invite</p>
        <h1 className="hero__names">
          Kita Invite — POC Open Graph (Varian B: React Router SSR)
        </h1>
        <p className="section__lead">
          Proof of concept: metadata Open Graph + Server-Side Rendering dengan
          React Router (tanpa Hono). Pilih salah satu undangan fiktif di bawah
          ini.
        </p>
        <ul>
          {invitations.map((inv) => (
            <li key={inv.slug}>
              <Link to={`/${inv.slug}`}>{inv.names}</Link> — {inv.dateDisplay},{" "}
              {inv.venue}
            </li>
          ))}
        </ul>
        <p>
          Catatan POC: tidak ada pembayaran, login, form kontak, atau data
          nyata. Semua nama, tanggal, dan venue di halaman ini fiktif.
        </p>
      </section>
      <footer className="footer">
        <p className="footer__names">Kita Invite</p>
        <p>POC Open Graph — Varian B (React Router SSR)</p>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Halaman undangan
// ---------------------------------------------------------------------------

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeCountdown(targetIso: string): CountdownParts {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function InvitationPage() {
  const inv = useLoaderData() as Invitation;
  const [opened, setOpened] = useState(false);
  // Countdown diisi setelah mount (useEffect) supaya render pertama server
  // dan client identik — tidak ada hydration mismatch.
  const [countdown, setCountdown] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(computeCountdown(inv.date));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [inv.date]);

  const cells: Array<{ label: string; value: number | null }> = [
    { label: "Hari", value: countdown?.days ?? null },
    { label: "Jam", value: countdown?.hours ?? null },
    { label: "Menit", value: countdown?.minutes ?? null },
    { label: "Detik", value: countdown?.seconds ?? null },
  ];

  return (
    <main className="page">
      <section className="hero">
        <img
          className="hero__cover"
          src={`/images/${inv.coverImage}`}
          alt={`Sampul undangan ${inv.names}`}
        />
        <p className="hero__eyebrow">Undangan Pernikahan</p>
        <h1 className="hero__names">{inv.names}</h1>
        <p className="hero__date">{inv.dateDisplay}</p>
        <p className="hero__venue">{inv.venue}</p>
        <p className="section__lead">{inv.description}</p>
        <button
          type="button"
          className="open-btn"
          onClick={() => setOpened((v) => !v)}
        >
          {opened ? "Tutup Undangan" : "Buka Undangan"}
        </button>
      </section>

      {opened && (
        <>
          <div className="countdown" aria-label="Hitung mundur menuju acara">
            {cells.map((cell) => (
              <div className="countdown__cell" key={cell.label}>
                <span className="countdown__num">
                  {cell.value === null
                    ? "–"
                    : String(cell.value).padStart(2, "0")}
                </span>
                <span className="countdown__label">{cell.label}</span>
              </div>
            ))}
          </div>

          <section className="section">
            <h2 className="section__title">Detail Acara</h2>
            <hr className="section__rule" />
            {inv.details.map((detail) => (
              <article className="detail" key={detail.title}>
                <h3 className="detail__title">{detail.title}</h3>
                <p className="detail__time">{detail.time}</p>
                <p className="detail__desc">{detail.description}</p>
              </article>
            ))}
          </section>

          <section className="section">
            <h2 className="section__title">Galeri</h2>
            <hr className="section__rule" />
            <div className="gallery">
              {inv.gallery.map((item, i) => (
                <article
                  className={
                    inv.gallery.length % 2 === 1 && i === inv.gallery.length - 1
                      ? "gallery__item gallery__item--wide"
                      : "gallery__item"
                  }
                  key={item.title}
                >
                  <img
                    className="gallery__img"
                    src={`/images/${inv.coverImage}`}
                    alt={item.title}
                  />
                  <div className="gallery__caption">
                    <h3>{item.title}</h3>
                    <p>{item.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <p className="footer__names">{inv.names}</p>
        <p>
          {inv.dateDisplay} — {inv.venue}
        </p>
        <p>Kita Invite — POC Open Graph (Varian B)</p>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Halaman 404 — TIDAK memuat data pasangan lain.
// ---------------------------------------------------------------------------

function NotFoundPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  return (
    <main className="page">
      <section className="hero">
        <p className="hero__eyebrow">Kita Invite</p>
        <h1 className="hero__names">Undangan tidak ditemukan</h1>
        <p className="section__lead">
          {status === 404
            ? "Tautan undangan yang Anda buka tidak dikenal. Periksa kembali tautannya."
            : "Terjadi kesalahan saat memuat undangan."}
        </p>
        <p>
          <Link to="/">Kembali ke halaman utama</Link>
        </p>
      </section>
    </main>
  );
}
