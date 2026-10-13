'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnaSayfa() {
  const router = useRouter();
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const CLOUD_NAME = "qlxdd0ki";
  const UPLOAD_PRESET = "SINEM_HARUN";
  const ADMIN_PASS = "171026";

  useEffect(() => {
    // Cloudinary widget script yüklemesi
    if (!document.getElementById('cloudinary-widget-script')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-widget-script';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const openUploadWidget = () => {
    if (window.cloudinary) {
      window.cloudinary.createUploadWidget({
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'camera'],
        multiple: true,
        maxFiles: 10
      }, (error, result) => {
        if (!error && result && result.event === "success") {
          const newUrl = result.info.secure_url;
          
          // LocalStorage'a da kaydedelim ki galeri sayfasında anında görünsün
          try {
            const stored = localStorage.getItem('sinem_harun_wedding_gallery');
            let photos = stored ? JSON.parse(stored) : [];
            if (!photos.includes(newUrl)) {
              photos.unshift(newUrl);
              localStorage.setItem('sinem_harun_wedding_gallery', JSON.stringify(photos));
            }
          } catch (e) {}

          alert("Fotoğrafınız başarıyla gönderildi! Teşekkür ederiz. ✨");
        }
      }).open();
    }
  };

  const verifyAdmin = () => {
    if (adminPassword === ADMIN_PASS) {
      setAdminPassword('');
      setIsAdminModalOpen(false);
      // Şifre doğruysa doğrudan galeri sayfasına yönlendir
      router.push('/galeri');
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
        <div className="flex items-center gap-2">
          {/* Kilit Butonu - Tıklayınca Şifre Sorar, Bilinirse Galeriye Atar */}
          <button 
            onClick={() => setIsAdminModalOpen(true)} 
            className="p-2.5 text-rose-200/80 hover:text-white transition rounded-full hover:bg-white/10 flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 cursor-pointer" 
            title="Bulut Galeriye Git / Yönetici Girişi"
          >
            <span>🔒</span>
            <span>Bulut Galeriye Git</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12 relative z-10 space-y-8 flex-grow flex flex-col items-center justify-center text-center">
        <div className="rounded-3xl p-8 md:p-12 space-y-6 shadow-2xl relative overflow-hidden w-full max-w-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="space-y-2">
            <p className="text-xs tracking-widest text-rose-300 uppercase font-medium">Hoş Geldiniz</p>
            <h1 className="text-4xl md:text-6xl text-white font-medium tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Sinem & Harun</h1>
            <p className="text-sm text-rose-200/80 pt-1 font-light">17 Ekim 2026</p>
          </div>
          <p className="text-sm text-rose-100/70 max-w-md mx-auto font-light leading-relaxed">
            Bu özel günümüzden çektiğiniz tüm güzel anıları ve fotoğrafları bizimle paylaşarak albümümüze katkıda bulunabilirsiniz. ✨
          </p>
          <div className="pt-4">
            <button onClick={openUploadWidget} className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-rose-900/40 transition-all cursor-pointer text-base">
              <span>📷 Fotoğraf Yükle</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-rose-100/70 py-6 font-light space-y-1">
        <div>Sevgiyle Paylaşın • Sinem & Harun ✨</div>
        <div className="text-[11px] opacity-80">Created by <a href="https://instagram.com/ori.bilisim" target="_blank" className="font-semibold underline hover:text-white transition">ori.bilisim 🤍</a></div>
      </footer>

      {/* Şifre Giriş Modalı */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl relative border border-white/20" style={{ background: 'rgba(20, 5, 10, 0.95)', backdropFilter: 'blur(16px)' }}>
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 right-4 text-rose-200/60 hover:text-white">✕</button>
            <h3 className="text-lg text-center text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Yönetici Girişi</h3>
            <input 
              type="password" 
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
              placeholder="Şifre" 
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 text-center text-sm" 
              autoFocus
            />
            <button onClick={verifyAdmin} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-xl transition text-sm cursor-pointer">Giriş Yap</button>
          </div>
        </div>
      )}
    </div>
  );
