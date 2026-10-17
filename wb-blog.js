/* wb-blog.js — kirim teks ke blog (wb.prediction). Muat dengan: <script type="module" src="wb-blog.js"></script>
   Hanya akun Google ADMIN yang bisa mengirim. Halaman lain memanggil window.WB_BLOG. */
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
let user = null;

const isAdmin = () => !!(user && user.email && user.email.toLowerCase() === ADMIN_EMAIL && user.emailVerified);
const say = m => (typeof window.toast === "function" ? window.toast(m, 2600) : alert(m));

async function login(){
  try { const pv = new GoogleAuthProvider(); pv.setCustomParameters({ login_hint: ADMIN_EMAIL }); await signInWithPopup(auth, pv); }
  catch (e) { if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") say("Gagal login blog: " + e.code); }
}

/* kirim satu tulisan; mengembalikan true/false */
async function kirim(judul, isi, diam){
  if (!isAdmin()) { say("Login blog dulu dengan akun admin"); return false; }
  judul = String(judul || "").trim().slice(0, 120);
  isi = String(isi || "").trim();
  if (isi.length > 5000) isi = isi.slice(0, 4990) + "…";
  if (!judul || !isi) { say("Teks kosong"); return false; }
  try {
    await addDoc(collection(db, "posts"), { judul, isi, uid: user.uid, nama: user.displayName || "Admin", createdAt: serverTimestamp() });
    if (!diam) say("📝 Terkirim ke blog");
    return true;
  } catch (e) { say("Gagal kirim: " + e.code); return false; }
}

/* kirim banyak: list = [{judul, isi}, ...] */
async function kirimBanyak(list){
  if (!isAdmin()) { say("Login blog dulu dengan akun admin"); return 0; }
  if (!list.length) { say("Tidak ada yang dikirim"); return 0; }
  if (!confirm("Kirim " + list.length + " tulisan ke blog?")) return 0;
  let ok = 0;
  for (const x of list) { say("Mengirim " + (ok + 1) + "/" + list.length + "…"); if (await kirim(x.judul, x.isi, true)) ok++; else break; }
  say("📝 " + ok + " dari " + list.length + " terkirim ke blog");
  return ok;
}

window.WB_BLOG = { isAdmin, login, logout: () => signOut(auth), kirim, kirimBanyak };
onAuthStateChanged(auth, u => { user = u; window.dispatchEvent(new Event("wb-blog")); });
