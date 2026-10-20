/* wb-config.js — satu-satunya tempat pengaturan untuk wb-member-bank.js (Scan 1–5)
   Muat SEBELUM wb-member-bank.js. */
window.WB_CONFIG = {
  // Cloudflare Worker penyimpanan (sama dengan yang dipakai index.html)
  WORKER: 'https://steep-resonance-6a71.kjago7822.workers.dev',

  // Nama akun = pemisah data (member, log, bank). Kosong = otomatis dari alamat GitHub Pages
  // (contoh: paitoangka1234-cpu.github.io -> "paitoangka1234-cpu"). Isi manual kalau mau data
  // dipakai bersama dengan situs lain, mis. 'mamakeavif-star'.
  ACCT: 'scenangka-scenangka',   // sama dengan hasil otomatis dari alamat scenangka.github.io/Scenangka/ (dikunci supaya versi satu file/iframe memakai akun yang sama)

  // Login admin DISEMBUNYIKAN dari member: tab/form admin hanya ada kalau alamat berakhiran ini
  // (contoh: https://scenangka.github.io/Scenangka/#admin). Kosongkan '' kalau mau tab Admin selalu tampil.
  ADMIN_HASH: '#admin',

  // Batas rumus bank per member PER SCAN kalau admin belum mengisi batas khusus (admin = tanpa batas)
  BANK_LIMIT_DEFAULT: 100,

  // prediksi.html: simpan trek ke Bank Prediksi sendiri (bank.html); suara rumus tetap dibaca dari Bank Utama Scan 3
  PRED_APP: 'prediksi',
  PRED_FORMAT: 'scan3',

  // Firebase blog (dipakai tombol "Kirim ke Blog" di prediksi.html)
  FIREBASE: {
  apiKey: "AIzaSyAZQuaa9qx4KZwFHPvk9ygJ_WphFnJ9Qnk",
  authDomain: "wb-prediction.firebaseapp.com",
  projectId: "wb-prediction",
  storageBucket: "wb-prediction.firebasestorage.app",
  messagingSenderId: "229482027147",
  appId: "1:229482027147:web:b960d808af5f39721bdc8e"
},

  // Link Toko Member (tombol "Toko Member" di toko.html). Admin bisa buka/kunci tiap link di
  // panel Admin > Pengaturan. Kunci: id harus unik, url = alamat situs member.
  TOKO_LINKS: [
    { id: 'kjago7822',                    url: 'https://kjago7822.github.io/WB-PREDICTION-/' },
    { id: 'wgus543-hub',                  url: 'https://wgus543-hub.github.io/WB-PREDICTION-/' },
    { id: 'mamakeavif-star',              url: 'https://mamakeavif-star.github.io/WB-PREDICTION-/' },
    { id: 'adinealif-byte',               url: 'https://adinealif-byte.github.io/WB-PREDICTION-/' },
    { id: 'paitoangka1234-cpu',           url: 'https://paitoangka1234-cpu.github.io/WB-scen/' },
    { id: 'kpps33040420090144-creator',   url: 'https://kpps33040420090144-creator.github.io/WB-PREDICTION-/' },
    { id: 'bototomart787-png',            url: 'https://bototomart787-png.github.io/Scenangka/' }
  ],

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
    { key: 'prediksi',    label: 'Prediksi Auto',     sel: ['#btnPrediksi'],           txt: [] },
    { key: 'bank_prediksi', label: 'Bank Prediksi',   sel: ['#btnBankPrediksi'],       txt: [] },
    { key: 'harian',        label: 'Harian',          sel: [],                         txt: [] },
    { key: 'rekap',         label: 'Rekap',           sel: [],                         txt: [] }
  ]
};

/* ===== Tombol "Aplikasi" (menu di toko.html & blog.html) -> buka link Toko yang aktif =====
   Aktif = tidak dikunci di admin scenangka (sama dengan tombol Toko Member).
   Pakai situs yang tadi dipilih lewat Toko Member kalau masih aktif, kalau tidak acak dari yang aktif.
   Kalau semua terkunci / gagal baca status: perilaku lama (./?app=1). Halaman lain tidak terpengaruh. */
(function () {
  'use strict';
  if (!/(^|\/)(toko|blog)(\.html)?$/.test(location.pathname)) return;
  var cache = null;

  function cfg() {
    var S = window.WB_STORE || {}, C = window.WB_CONFIG || {};
    return {
      links: C.TOKO_LINKS || S.tokoLinks || [],
      worker: C.WORKER || S.worker || '',
      acct: C.ACCT || 'scenangka-scenangka'
    };
  }
  function ambil(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) { return r.json(); });
  }
  /* hasil: objek status {id:false = terkunci}, atau null kalau gagal baca */
  function muat() {
    if (cache) return cache;
    var c = cfg();
    if (!c.worker) return Promise.resolve(null);
    var base = c.worker + '/' + c.acct;
    cache = ambil(base + '/logs').then(function (lg) {
      var mb = lg && lg.membersBin;
      if (!mb) return null;
      return ambil(base + '/' + mb).then(function (d) {
        var arr = Array.isArray(d) ? d : ((d && d.data) || []);
        var st = arr.find(function (m) { return m.id === '__SETTINGS__'; });
        return (st && st.tk) ? st.tk : {};
      });
    }).catch(function () { return null; }).then(function (r) {
      if (r === null) cache = null;   /* gagal: boleh coba lagi di klik berikutnya */
      return r;
    });
    return cache;
  }
  function pilih(status, links) {
    var buka = links.filter(function (l) { return status[l.id] !== false; });
    if (!buka.length) return null;
    var simpan = '';
    try { simpan = localStorage.getItem('wb_toko_situs') || ''; } catch (e) {}
    for (var i = 0; i < buka.length; i++) if (buka[i].id === simpan) return buka[i];
    return buka[Math.floor(Math.random() * buka.length)];
  }
  function cocok(a) {
    var h = a.getAttribute('href') || '';
    if (/[?&]app=1(&|$)/.test(h)) return true;
    return !!a.closest('nav,.nav') && a.textContent.trim().toLowerCase() === 'aplikasi';
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    var links = cfg().links;
    if (!a || !links.length || !cocok(a)) return;
    e.preventDefault();
    var asal = a.href;
    a.style.opacity = '.6';
    muat().then(function (st) {
      var p = st ? pilih(st, links) : null;
      location.href = p ? p.url : asal;
    });
  }, true);

  document.addEventListener('DOMContentLoaded', muat);
})();
