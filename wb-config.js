/* wb-config.js — satu-satunya tempat pengaturan untuk wb-member-bank.js (Scan 1–5)
   Muat SEBELUM wb-member-bank.js. */
window.WB_CONFIG = {
  // Cloudflare Worker penyimpanan (sama dengan yang dipakai index.html)
  WORKER: 'https://steep-resonance-6a71.kjago7822.workers.dev',

  // Nama akun = pemisah data (member, log, bank). Kosong = otomatis dari alamat GitHub Pages
  // (contoh: paitoangka1234-cpu.github.io -> "paitoangka1234-cpu"). Isi manual kalau mau data
  // dipakai bersama dengan situs lain, mis. 'mamakeavif-star'.
  ACCT: '',

  // Login admin DISEMBUNYIKAN dari member: tab/form admin hanya ada kalau alamat berakhiran ini
  // (contoh: https://scenangka.github.io/Scenangka/#admin). Kosongkan '' kalau mau tab Admin selalu tampil.
  ADMIN_HASH: '#admin',

  // Batas rumus bank per member PER SCAN kalau admin belum mengisi batas khusus (admin = tanpa batas)
  BANK_LIMIT_DEFAULT: 100,

  // prediksi.html: simpan/baca bank di Bank Utama Scan 3 (format sama dengan tab Bank)
  PRED_APP: 'scan3',
  PRED_FORMAT: 'scan3',

  // Fitur yang bisa dikunci admin (global atau per member).
  //  sel = selector CSS (scan5 / scan2 / scan3), txt = pola teks tombol (scan1 & scan4 yang tanpa id)
  FEATS: [
    { key: 'tab_scan',    label: 'Tab Scan',          sel: ['.ntab[data-p="scan"]'],   txt: ['SCAN OTOMATIS'] },
    { key: 'tab_bank',    label: 'Tab Bank',          sel: ['.ntab[data-p="bank"]'],   txt: ['^\\W*Bank( Rumus)?\\W*$'] },
    { key: 'tab_manual',  label: 'Tab Manual',        sel: ['.ntab[data-p="manual"]'], txt: ['Manual( Builder)?'] },
    { key: 'scan_run',    label: 'Jalankan Scan',     sel: ['#btnScan', '#btn-scan-all'], txt: ['^\\W*(Mulai )?Scan( Semua)?\\W*$'] },
    { key: 'save_bank',   label: 'Simpan ke Bank',    sel: ['[data-act="save"]', '#btnSaveAll', '#btnMbSave'], txt: ['Simpan ke Bank', 'Simpan Semua'] },
    { key: 'bank_hapus',  label: 'Hapus Rumus Bank',  sel: ['#btnBHapus', '#btnBHapusPatah', '[data-ba="del"]', '#bact-hapus'], txt: ['^\\W*Hapus', 'Reset Semua Bank'] },
    { key: 'bank_update', label: 'Update Rumus Bank', sel: ['#btnBUpdate', '[data-ba="upd"]', '#bact-update'], txt: ['^\\W*Update\\W*$'] },
    { key: 'bank_trek',   label: 'Trek & Rekap Bank', sel: ['#btnBTrek', '#btnBRekap', '#bact-trek', '#bact-rekap'], txt: ['^\\W*Trek\\W*$', 'Gabungan', '^\\W*Rekap'] },
    { key: 'kirim_wa',    label: 'Kirim ke WA',       sel: ['#btnBWA', '#btnDtWA', '[data-act="wa"]', '[data-ba="wa"]', '#bact-wa'], txt: ['^\\W*(Kirim )?WA\\b'] },
    { key: 'auto_put',    label: 'Auto Cari Put',     sel: ['#btnAutoPut'],            txt: [] },
    { key: 'prediksi',    label: 'Prediksi Auto',     sel: ['#btnPrediksi'],           txt: [] }
  ]
};
