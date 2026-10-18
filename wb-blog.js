/* wb-blog.js — kirim teks ke blog (wb.prediction), khusus akun Google ADMIN.
   Cara kerja: tap 📋 Copy / Salin Semua seperti biasa, lalu tap tombol 📝 melayang di pojok kanan bawah.
   Dimuat otomatis lewat satu baris di wb-config.js (semua halaman: bank, prediksi, scan 1-5). */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const ADMIN_EMAIL = "scenangka@gmail.com";
const app = initializeApp({
  apiKey: "AIzaSyAZQuaa9qx4KZwFHPvk9ygJ_WphFnJ9Qnk",
  authDomain: "wb-prediction.firebaseapp.com",
  projectId: "wb-prediction",
  storageBucket: "wb-prediction.firebasestorage.app",
  messagingSenderId: "229482027147",
  appId: "1:229482027147:web:b960d808af5f39721bdc8e"
});
const auth = getAuth(app), db = getFirestore(app);
let user = null, lastCopy = "";

const isAdmin = () => !!(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL && user.emailVerified);
/* admin aplikasi (login password admin) tersimpan di localStorage sebagai objek dengan isAdmin:true */
const appAdmin = () => { try { for (let i = 0; i < localStorage.length; i++) { const v = localStorage.getItem(localStorage.key(i)); if (v && v.indexOf('"isAdmin":true') > -1) { const o = JSON.parse(v); if (o && o.isAdmin === true) return true; } } } catch (e) {} return false; };

/* ---------- pesan kecil (tidak bergantung pada halaman) ---------- */
let noteEl, noteT;
function note(m, ms = 2600) {
  if (!document.body) return;
  if (!noteEl) { noteEl = document.createElement("div"); noteEl.style.cssText = "position:fixed;left:50%;bottom:78px;transform:translateX(-50%);max-width:86vw;z-index:100000;background:#10192b;color:#fff;border:1px solid #3a5a9a;border-radius:12px;padding:9px 14px;font:600 13px/1.4 system-ui,sans-serif;text-align:center"; document.body.appendChild(noteEl); }
  noteEl.textContent = m; noteEl.style.display = "block"; clearTimeout(noteT); noteT = setTimeout(() => noteEl.style.display = "none", ms);
}

/* ---------- login & kirim ---------- */
async function login() {
  try { const pv = new GoogleAuthProvider(); pv.setCustomParameters({ login_hint: ADMIN_EMAIL }); await signInWithPopup(auth, pv); }
  catch (e) { if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") note("Gagal login blog: " + e.code, 5000); }
}
async function kirim(judul, isi, diam) {
  if (!isAdmin()) { note("Login blog dulu dengan akun admin"); return false; }
  judul = String(judul || "").trim().slice(0, 120);
  isi = String(isi || "").trim();
  if (isi.length > 5000) isi = isi.slice(0, 4990) + "…";
  if (!judul || !isi) { note("Teks kosong"); return false; }
  try {
    await addDoc(collection(db, "posts"), { judul, isi, uid: user.uid, nama: user.displayName || "Admin", createdAt: serverTimestamp() });
    if (!diam) note("📝 Terkirim ke blog");
    return true;
  } catch (e) { note("Gagal kirim: " + e.code, 5000); return false; }
}
async function kirimBanyak(list) {
  if (!isAdmin()) { note("Login blog dulu dengan akun admin"); return 0; }
  if (!list.length) { note("Tidak ada yang dikirim"); return 0; }
  if (list.length > 1 && !confirm("Kirim " + list.length + " tulisan ke blog?")) return 0;
  let ok = 0;
  for (const x of list) { note("Mengirim " + (ok + 1) + "/" + list.length + "…", 4000); if (await kirim(x.judul, x.isi, true)) ok++; else break; }
  note("📝 " + ok + " dari " + list.length + " terkirim ke blog", 3500);
  return ok;
}

/* ---------- teks salinan -> tulisan blog (satu pasaran / satu trek = satu tulisan) ---------- */
const HEAD = /WB\.PREDICTION/i;
const judulDari = blok => {
  for (const l of blok.split("\n")) {
    const t = l.trim(); if (!t || HEAD.test(t)) continue;
    const dasar = t.replace(/^[^\p{L}\p{N}]+/u, "").replace(/\s*\(tutup.*$/i, "").replace(/\s+Keluaran.*$/i, "").trim() || "Prediksi";
    const kd = blok.match(/Code\s*[:：]\s*(\S+)/i);
    return (kd ? dasar + " · " + kd[1] : dasar).slice(0, 120);
  }
  return "Prediksi";
};
function bagi(teks) {
  const t = String(teks || "").replace(/\r/g, "").trim();
  if (!t) return [];
  const part = t.split(/^(?=[\u{1F1E6}-\u{1F1FF}]{2}|🌐)/mu).map(x => x.trim()).filter(Boolean);
  const out = [];
  part.forEach(p => { if (out.length && HEAD.test(out[out.length - 1]) && out[out.length - 1].length < 40) out[out.length - 1] += "\n\n" + p; else out.push(p); });
  return out.map(p => ({ judul: judulDari(p), isi: p }));
}

/* ---------- tangkap teks yang disalin lewat tombol Copy halaman ---------- */
let waiter = null;
function setLast(t) { t = String(t || ""); if (t.trim().length > 3) { lastCopy = t; const w = waiter; waiter = null; if (w) w(t); refresh(!w); } }
/* menekan tombol Copy milik halaman lewat kode, lalu mengambil teks yang disalinnya */
function ambil(el) { return new Promise(res => { waiter = res; el.click(); setTimeout(() => { if (waiter === res) { waiter = null; res(""); } }, 900); }); }
async function kirimDari(el) {
  if (!isAdmin()) { login(); return; }
  const t = await ambil(el);
  if (!t) { note("Teks tidak terbaca. Tap 📋 Copy dulu, lalu tombol 📝 melayang", 4000); return; }
  await kirimBanyak(bagi(t));
}
/* tambahkan 📝 di samping setiap tombol Copy / Salin Semua pada halaman */
function tambahTombol() {
  const adm = isAdmin();
  document.querySelectorAll(".wbx").forEach(e => e.style.display = adm ? "" : "none");
  if (!adm) return;
  document.querySelectorAll("button").forEach(b => {
    if (b.classList.contains("wbx") || b.dataset.wbx) return;
    const t = (b.textContent || "").trim();
    const semua = /salin\s*semua/i.test(t);
    const copy = !semua && ((/^[^\p{L}\p{N}]*$/u.test(t) && t.includes("📋")) || /^[^\p{L}\p{N}]*(copy|salin)[^\p{L}\p{N}]*$/iu.test(t));
    if (!semua && !copy) return;
    b.dataset.wbx = "1";
    const n = b.nextElementSibling;
    if (n && (n.classList.contains("wbblog") || (n.textContent || "").trim().startsWith("📝"))) return;
    const x = document.createElement("button");
    x.type = "button"; x.className = b.className + " wbx"; x.title = "Kirim ke blog";
    x.textContent = semua ? "📝 Kirim Semua" : "📝";
    x.onclick = e => { e.stopPropagation(); e.preventDefault(); kirimDari(b); };
    b.insertAdjacentElement("afterend", x);
  });
}
try {
  const cb = navigator.clipboard;
  if (cb && cb.writeText) { const w = cb.writeText.bind(cb); cb.writeText = t => { setLast(t); return w(t); }; }
} catch (e) {}
try {
  const ec = document.execCommand.bind(document);
  document.execCommand = function (c, ...a) {
    if (String(c).toLowerCase() === "copy") {
      try { const el = document.activeElement; let t = ""; if (el && typeof el.value === "string" && el.selectionStart != null) t = el.value.slice(el.selectionStart, el.selectionEnd) || el.value; else t = String(getSelection()); setLast(t); } catch (e) {}
    }
    return ec(c, ...a);
  };
} catch (e) {}

/* ---------- tombol melayang (hanya untuk admin) ---------- */
let bar, btn;
function ensureBar() {
  if (bar || !document.body) return;
  bar = document.createElement("div");
  bar.style.cssText = "position:fixed;right:12px;bottom:14px;z-index:100000;display:none";
  btn = document.createElement("button");
  btn.style.cssText = "font:700 14px/1.2 system-ui,sans-serif;color:#fff;background:#1d2b4a;border:1.5px solid #6f93ff;border-radius:99px;padding:11px 18px;box-shadow:0 4px 14px rgba(0,0,0,.45);cursor:pointer";
  btn.onclick = async () => {
    if (!isAdmin()) { login(); return; }
    const list = bagi(lastCopy);
    if (!list.length) { note("Tap 📋 Copy atau Salin Semua dulu, lalu tap tombol ini"); return; }
    btn.disabled = true;
    const n = await kirimBanyak(list);
    if (n) lastCopy = "";
    btn.disabled = false; refresh();
  };
  bar.appendChild(btn); document.body.appendChild(bar);
}
function refresh(baru) {
  ensureBar(); if (!bar) return;
  const blogAdm = isAdmin();
  if (!blogAdm && !appAdmin()) { bar.style.display = "none"; return; }
  bar.style.display = "block";
  if (!blogAdm) { btn.textContent = "🔐 Login Blog"; btn.style.borderColor = "#6f93ff"; return; }
  const n = bagi(lastCopy).length;
  btn.textContent = n ? "📝 Kirim ke Blog" + (n > 1 ? " (" + n + ")" : "") : "📝 Blog: salin dulu";
  btn.style.background = n ? "#0b6b3a" : "#1d2b4a";
  btn.style.borderColor = n ? "#3ddc84" : "#6f93ff";
  if (baru && n) note("Siap dikirim ke blog: tap 📝");
}
setInterval(() => { refresh(); tambahTombol(); }, 1500);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => refresh()); else refresh();

window.WB_BLOG = { isAdmin, login, logout: () => signOut(auth), kirim, kirimBanyak };
onAuthStateChanged(auth, u => { user = u; window.dispatchEvent(new Event("wb-blog")); refresh(); });
