'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const CLOUD_NAME = "qlxdd0ki";
  const UPLOAD_PRESET = "SİNEM_HARUN";
  const ADMIN_PASS = "171026";

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Cloudinary Upload Widget yüklemesi için script tetikleyici
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openUploadWidget = () => {
    if (window.cloudinary) {
      window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          sources: ["local", "camera"],
          multiple: true,
          maxFiles: 10,
          folder: "SİNEM_HARUN", // Fotoğrafların yükleneceği Cloudinary klasörü
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            alert("Fotoğrafınız başarıyla gönderildi! Teşekkür ederiz. ✨");
          }
        }
      ).open();
    } else {
      alert("Yükleme aracı yükleniyor, lütfen birkaç saniye sonra tekrar deneyin.");
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASS) {
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminPassword("");
    } else {
      alert("Hatalı şifre!");
    }
  };

  return (
    <div className="min-h-screen text-rose-50 flex flex-col justify-between relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-rose-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <header className="p-4 flex justify-between items-center relative z-20 container mx-auto max-w-4xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-widest text-rose-200/70 font-light">Anı Albümü</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/galeri" 
            className="text-xs bg-rose-600/80 hover:bg-rose-600 px-4 py-2 rounded-full transition text-white font-medium shadow-md"
          >
            Galeriye Git 📸
          </Link>
          <button 
            onClick={() => setIsAdminModalOpen(true)} 
            className="p-2 text-rose-200/60 hover:text-rose-100 transition rounded-full hover:bg-white/5" 
            title="Yönetici Girişi"
          >
            🔒
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6 relative z-10 space-y-8 flex-grow">
        <div className="rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="space-y-1">
            <p className="text-xs tracking-widest text-rose-300 uppercase font-medium">Hoş Geldiniz</p>
            <h1 className="text-4xl md:text-5xl text-white font-medium tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Sinem & Harun</h1>
            <p className="text-sm text-rose-200/80 pt-1 font-light">17 Ekim 2026</p>
          </div>
          <p className="text-sm text-rose-100/70 max-w-md mx-auto font-light leading-relaxed">
            Bu özel günümüzden çektiğiniz tüm güzel anıları ve fotoğrafları bizimle paylaşarak albümümüze katkıda bulunabilirsiniz. ✨
          </p>
          <div className="pt-2">
            <button 
              onClick={openUploadWidget}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white px-8 py-3.5 rounded-full font-medium shadow-lg hover:shadow-rose-900/40 transition-all cursor-pointer"
            >
              <span>Fotoğraf Yükle</span>
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="text-center p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl">
            <p className="text-sm text-rose-200 mb-2">Yönetici Modu Aktif: Tüm fotoğrafları canlı galeride görmek için üstteki butonu kullanabilirsiniz.</p>
            <Link href="/galeri" className="text-xs bg-white text-rose-950 px-4 py-2 rounded-xl font-bold">Cloudinary Galerisini Aç</Link>
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center text-xs text-rose-100/70 py-6 font-light space-y-1">
        <div>Sevgiyle Paylaşın • Sinem & Harun ✨</div>
        <div className="text-[11px] opacity-80">Created by <a href="https://instagram.com/ori.bilisim" target="_blank" className="font-semibold underline hover:text-white transition">ori.bilisim 🤍</a></div>
      </footer>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl relative border border-white/20" style={{ background: 'rgba(20, 5, 10, 0.95)' }}>
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 right-4 text-rose-200/60 hover:text-white">✕</button>
            <h3 className="text-lg text-center text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Yönetici Girişi</h3>
            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input 
                type="password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Şifre" 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 text-center text-sm"
              />
              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-xl transition text-sm">Giriş Yap</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
