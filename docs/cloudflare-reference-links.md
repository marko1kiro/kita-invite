# Referensi Cloudflare untuk fondasi Fase 1

- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/): tier Free/Paid dan batas usage.
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/): jumlah database, storage, dan query allowance.
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/): storage, operasi, dan allowance bucket.
- [R2 metrics and analytics](https://developers.cloudflare.com/r2/platform/metrics-analytics/): operasi dan storage melalui GraphQL Analytics API.
- [D1 free-tier enforcement](https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/): perilaku limit harian D1 Free.
- [Workers static-assets direct upload](https://developers.cloudflare.com/workers/static-assets/direct-upload/): manifest/upload/version flow untuk static assets.

Endpoint API/metrics yang dijalankan pada akun Cloudflare tidak dicatat bersama ID akun atau token di repository. Status subscription/usage Workers belum bisa diverifikasi karena izin Billing Read tidak tersedia; karena itu Worker deployment/domain belum dijalankan.
