/**
 * Client React — Varian A (POC Open Graph Kita Invite).
 *
 * Membaca fixture undangan dari <script id="invitation-data"> yang disematkan
 * server, lalu merender halaman interaktif: tombol "Buka Undangan",
 * countdown live (berdetak tiap detik), seksi detail + galeri.
 * TANPA RSVP, TANPA pembayaran, TANPA login, TANPA form kontak.
 */
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Invitation } from './types';

function loadInvitation(): Invitation | null {
  const el = document.getElementById('invitation-data');
  if (!el || !el.textContent) return null;
  try {
    return JSON.parse(el.textContent) as Invitation;
  } catch {
    return null;
  }
}

interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
}

function computeCountdown(targetIso: string, nowMs: number): CountdownParts {
  const diff = new Date(targetIso).getTime() - nowMs;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    passed: false,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function App({ inv }: { inv: Invitation }) {
  const [opened, setOpened] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!opened) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [opened]);

  const cd = computeCountdown(inv.date, nowMs);

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
        <button
          className="open-btn"
          type="button"
          onClick={() => setOpened((v) => !v)}
          aria-expanded={opened}
        >
          {opened ? 'Tutup Undangan' : 'Buka Undangan'}
        </button>
      </section>

      {opened && (
        <>
          <section className="countdown" aria-label="Hitung mundur menuju hari acara">
            <div className="countdown__cell">
              <span className="countdown__num">{cd.days}</span>
              <span className="countdown__label">Hari</span>
            </div>
            <div className="countdown__cell">
              <span className="countdown__num">{pad(cd.hours)}</span>
              <span className="countdown__label">Jam</span>
            </div>
            <div className="countdown__cell">
              <span className="countdown__num">{pad(cd.minutes)}</span>
              <span className="countdown__label">Menit</span>
            </div>
            <div className="countdown__cell">
              <span className="countdown__num">{pad(cd.seconds)}</span>
              <span className="countdown__label">Detik</span>
            </div>
          </section>
          {cd.passed && <p className="section__lead">Acara telah berlangsung.</p>}

          <section className="section">
            <h2 className="section__title">Rangkaian Acara</h2>
            <hr className="section__rule" />
            <p className="section__lead">{inv.description}</p>
            {inv.details.map((d) => (
              <article className="detail" key={d.title}>
                <h3 className="detail__title">{d.title}</h3>
                <p className="detail__time">{d.time}</p>
                <p className="detail__desc">{d.description}</p>
              </article>
            ))}
          </section>

          <section className="section">
            <h2 className="section__title">Galeri</h2>
            <hr className="section__rule" />
            <div className="gallery">
              {inv.gallery.map((g) => (
                <article className="gallery__item" key={g.title}>
                  <img
                    className="gallery__img"
                    src={`/images/${inv.coverImage}`}
                    alt={g.title}
                  />
                  <div className="gallery__caption">
                    <h3>{g.title}</h3>
                    <p>{g.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="footer">
            <p className="footer__names">{inv.names}</p>
            <p>
              {inv.dateDisplay} — {inv.venue}
            </p>
            <p>POC Open Graph, Varian A (Hono + React). Undangan fiktif.</p>
          </footer>
        </>
      )}
    </main>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const inv = loadInvitation();
  if (inv) {
    createRoot(rootEl).render(<App inv={inv} />);
  } else {
    rootEl.innerHTML =
      '<main class="page"><p>Data undangan tidak tersedia.</p></main>';
  }
}
