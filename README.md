# RISKI.EXE

Portofolio developer Riski Wahyu Saputra dengan konsep memory card konsol retro awal 2000-an. Pengunjung menyalakan sistem, menjelajahi memory card 3D, lalu membuka save data untuk melihat tiap bagian portofolio.

Alur: **BOOT → MEMORY CARD BROWSER → PILIH SAVE → LOADING → JELAJAHI → KEMBALI KE BROWSER**

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # memperbarui snapshot GitHub lalu build produksi
npm run github     # hanya memperbarui src/data/github.json
```

## Kontrol

| Aksi | Mouse | Keyboard | Sentuh |
| --- | --- | --- | --- |
| Pilih slot | Hover | ← → | Swipe, tap ikon, atau tombol ◄ ► |
| Buka save | Klik | Enter | Tap ikon terpilih atau LOAD DATA |
| Save sebelumnya / berikutnya | Tombol navigasi | ← → | Tombol PREV / NEXT |
| Kembali ke browser | RETURN TO BROWSER | Esc | Tombol BROWSER |
| Putar memory card | Drag | | Drag |

Setiap save punya URL sendiri, misalnya `/#projects`, dan tombol back browser ikut berfungsi. Ada satu slot tersembunyi untuk yang tahu cheat code klasik atau yang cukup sering mengklik memory card.

## Struktur

```
src/
  app/        layout, halaman, token desain
  data/       isi portofolio: profil, project, journey, sertifikat, statistik GitHub, daftar save
  lib/        state machine sistem (store.ts) dan audio synth (audio.ts)
  three/      dunia 3D: atmosfer, memory card, ikon save, orbit slot, kamera
  ui/         boot, HUD, panel file, loading save, kerangka section, kursor, kontrol
  sections/   isi keenam save dan Dev Room
```

Untuk mengubah isi situs, cukup edit `src/data/`.

## Catatan teknis

- Next.js, TypeScript, Tailwind CSS, React Three Fiber, GSAP untuk kamera, Framer Motion untuk transisi UI.
- Semua ikon 3D dibuat lewat kode, jadi tidak ada file GLB/GLTF yang perlu diunduh.
- Semua suara disintesis dengan Web Audio dan OFF secara default.
- Tanpa WebGL, situs menampilkan menu slot biasa dan semua section tetap bisa dibuka. Coba dengan `/?no3d`.
- Identitas visualnya original dan tidak memakai logo, aset, atau suara milik konsol mana pun.
