#!/usr/bin/env python3
"""Exercise a local SQLite backup/restore using disposable synthetic data only."""

from pathlib import Path
import sqlite3
import tempfile


ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "migrations" / "0001_foundation_metadata.sql"


def main() -> None:
    migration = MIGRATION.read_text(encoding="utf-8")

    with tempfile.TemporaryDirectory(prefix="ki-foundation-backup-") as temp_dir:
        root = Path(temp_dir)
        source_path = root / "source.sqlite3"
        backup_path = root / "backup.sqlite3"

        source = sqlite3.connect(source_path)
        source.executescript(migration)
        source.execute(
            "INSERT INTO foundation_metadata (environment, key, value) VALUES (?, ?, ?)",
            ("dev", "backup-restore-smoke", '{"synthetic":true}'),
        )
        source.commit()

        backup = sqlite3.connect(backup_path)
        source.backup(backup)
        backup.close()
        source.close()

        restored = sqlite3.connect(backup_path)
        row = restored.execute(
            "SELECT environment, key, value FROM foundation_metadata WHERE key = ?",
            ("backup-restore-smoke",),
        ).fetchone()
        restored.close()

        expected = ("dev", "backup-restore-smoke", '{"synthetic":true}')
        if row != expected:
            raise SystemExit(f"restore mismatch: expected {expected!r}, got {row!r}")

    print("PASS: local SQLite backup/restore preserved one synthetic fixture; temporary files removed.")
    print("NOTE: this smoke test validates local SQLite only, not Cloudflare D1 export/import APIs.")


if __name__ == "__main__":
    main()
