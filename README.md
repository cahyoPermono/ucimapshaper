# UCI Mapshaper

Halo Suci,

Berikut adalah dokumentasi proyek **UCI Mapshaper**. Proyek ini adalah aplikasi web berbasis Vue 3 yang digunakan untuk mengunggah, menampilkan, dan menyederhanakan data spasial (GeoJSON, Shapefile, dsb) secara interaktif menggunakan Leaflet.

## Fitur Utama
- Upload file GeoJSON, Shapefile (ZIP), dan beberapa format lain.
- Visualisasi layer peta dengan Leaflet.
- Manajemen layer (tambah, hapus, visibilitas).
- Tools untuk simplifikasi geometri layer.
- Ekspor data ke format GeoJSON, Shapefile, dan TopoJSON (fitur ekspor shapefile/topojson masih placeholder).

## Struktur Proyek
- `src/components/` — Komponen utama (MapView, Sidebar, FileUploader, dsb).
- `src/stores/` — State management menggunakan Pinia.
- `src/views/` — Halaman utama aplikasi.
- `public/` — Asset publik.
- `index.html` — Entry point aplikasi.

## Cara Menjalankan
1. **Install dependencies**
   ```bash
   pnpm install
   # atau
   npm install
   ```
2. **Jalankan aplikasi dalam mode development**
   ```bash
   pnpm dev
   # atau
   npm run dev
   ```
3. **Akses aplikasi**
   Buka browser ke `http://localhost:5173` (atau port yang tertera di terminal).

## Penjelasan Alur Utama
- **Upload File:**
  - Komponen `FileUploader.vue` menangani drag & drop atau pemilihan file.
  - Mendukung `.json`, `.geojson`, `.zip` (shapefile), dan `.shp` (belum didukung penuh).
  - File yang diunggah akan diproses dan ditambahkan ke store layer.
- **Visualisasi Layer:**
  - Komponen `MapView.vue` akan merender semua layer yang aktif ke peta Leaflet.
- **Manajemen Layer:**
  - Komponen `Sidebar.vue` dan `LayersList.vue` untuk mengatur visibilitas, menghapus, dan menambah layer.
- **Simplifikasi:**
  - Komponen `SimplifyTools.vue` menyediakan tools untuk menyederhanakan geometri layer menggunakan algoritma Douglas-Peucker atau Visvalingam.

## Catatan untuk Pengembangan Lanjutan
- Fitur ekspor ke Shapefile dan TopoJSON masih berupa placeholder.
- Untuk mendukung file `.shp` standalone, perlu implementasi tambahan (saat ini hanya mendukung shapefile dalam format ZIP).
- Pastikan dependensi selalu up-to-date, terutama `shpjs`, `leaflet`, dan `@turf/turf`.

## Tips
- Jika ada error saat upload ZIP, pastikan file ZIP berisi semua komponen shapefile (`.shp`, `.shx`, `.dbf`, dll).
- Untuk debugging, cek console browser dan gunakan tools dev Vue.

---

Jika ada pertanyaan atau butuh bantuan, jangan ragu untuk tanya ya, Uci!

Salam,
Cahyo Ganteng
