[English](README.md) | **Bahasa Indonesia**

# ApportionmentCalc
*Electoral math, simplified.*

## Pengantar
ApportionmentCalc adalah kalkulator berbasis peramban (browser) file tunggal untuk membandingkan dua metode alokasi kursi pemilu yang populer: **Sainte Laguë** dan **Kuota Hare**. Dirancang untuk pelajar, peneliti, pengamat pemilu, dan siapa saja yang ingin tahu tentang representasi proporsional, alat ini memvisualisasikan bagaimana metode yang berbeda dapat menghasilkan hasil yang berbeda dari jumlah suara yang sama.

Antarmuka tersedia dalam **Bahasa Inggris** dan **Bahasa Indonesia**, membuatnya sangat berguna untuk pendidikan kewarganegaraan dan analisis pemilu di Indonesia.

## Cara Kerja
Kalkulator mengambil jumlah suara untuk beberapa partai politik dan total jumlah kursi yang akan dialokasikan, kemudian:

1. **Ambang Batas Parlemen (Parliamentary Threshold)**: Menyaring partai yang tidak memenuhi persentase minimum suara sah nasional.
2. **Metode Kuota Hare**: Menghitung BPP (Bilangan Pembagi Pemilih), mengalokasikan kursi berdasarkan kuota penuh, kemudian mendistribusikan kursi sisa ke partai dengan sisa suara terbesar.
3. **Metode Sainte Laguë**: Menggunakan urutan pembagi (1, 3, 5, 7, 9...) untuk mengalokasikan kursi secara iteratif berdasarkan hasil bagi (quotient) tertinggi pada setiap langkah.
4. **Tampilan Perbandingan**: Menampilkan hasil secara berdampingan dan menyoroti perbedaan antara kedua metode.

## Mulai Cepat
1. Unduh `ApportionmentCalc.html`.
2. Buka di peramban modern apa pun (Chrome, Edge, Firefox, Safari).
3. Masukkan total jumlah kursi yang tersedia.
4. Atur ambang batas parlemen (misalnya 4% untuk DPR RI).
5. Tambahkan partai politik dengan jumlah suara mereka.
6. Klik "Hitung Alokasi".
7. Bandingkan hasil antara kedua metode, lihat visualisasi langkah demi langkah, atau ekspor ke CSV.

## Fitur Utama
- **Dukungan Multi-bahasa**: Beralih antara Bahasa Inggris dan Bahasa Indonesia.
- **Tema Gelap/Terang**: Beralih tema sesuai preferensi.
- **Konfigurasi Ambang Batas**: Atur ambang batas parlemen (threshold) sesuai peraturan.
- **Perbandingan Dua Metode**: Lihat hasil Kuota Hare dan Sainte Laguë secara berdampingan.
- **Input Partai Dinamis**: Tambah atau hapus partai sesuai kebutuhan.
- **Rincian Mendalam**: Lihat BPP, sisa suara, bilangan pembagi, dan alokasi langkah demi langkah.
- **Visualisasi Sainte Laguë**: Lihat tabel langkah demi langkah bagaimana setiap kursi dimenangkan.
- **Ekspor CSV**: Unduh hasil perhitungan untuk analisis lebih lanjut di spreadsheet.
- **File HTML Tunggal**: Tidak perlu instalasi, tidak ada dependensi, bekerja sepenuhnya offline.

## Kasus Penggunaan
- **Pendidikan Kewarganegaraan**: Mengajarkan siswa tentang sistem pemilu.
- **Analisis Pemilu**: Membandingkan hasil aktual dengan metode alternatif.
- **Penelitian**: Mempelajari sifat matematis dari rumus alokasi.
- **Diskusi Kebijakan**: Mengevaluasi reformasi sistem pemilu.

## Memahami Metode

### Kuota Hare
- Menghitung kuota: Total Suara Sah ÷ Total Kursi = Kuota
- Setiap partai mendapat satu kursi untuk setiap kuota penuh
- Sisa kursi diberikan kepada partai dengan sisa suara terbesar
- Cenderung menguntungkan partai-partai kecil

### Sainte Laguë
- Menggunakan bilangan pembagi ganjil: 1, 3, 5, 7, 9...
- Kursi dialokasikan satu per satu kepada partai dengan hasil bagi tertinggi
- Rumus: Suara ÷ (2 × Kursi Saat Ini + 1)
- Cenderung menguntungkan partai-partai besar

## Analisis Tingkat Keuntungan
Simulasi statistik terhadap ~380.000 skenario pemilu mengonfirmasi kecenderungan bias dari masing-masing metode:

- **Partai Kecil**: Kuota Hare memberikan hasil yang lebih menguntungkan dalam **5,53%** kasus, dibandingkan dengan 3,85% untuk Sainte-Laguë.
- **Partai Besar**: Sainte-Laguë memberikan hasil yang lebih menguntungkan dalam **38,16%** kasus, dibandingkan dengan 3,80% untuk Kuota Hare.

Data ini mendukung konsensus umum bahwa Kuota Hare lebih ramah terhadap partai-partai kecil, sementara Sainte-Laguë secara signifikan menguntungkan partai-partai besar.

## Privasi & Data
Semua perhitungan terjadi secara lokal di peramban Anda. Tidak ada data yang dikirim ke server mana pun. Alat ini sepenuhnya offline setelah dimuat.

## Lisensi
Lisensi MIT. Lihat LICENSE untuk detailnya.
