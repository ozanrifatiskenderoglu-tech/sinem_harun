'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AnaSayfa() {
  const CLOUD_NAME = "qlxdd0ki";
  const UPLOAD_PRESET = "SINEM_HARUN";

  useEffect(() => {
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

  return (
    <div className="min-h-screen text-rose-50 flex flex-col justify-between relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
      
      {/* Üst Menü */}
      <header className="p-4 flex justify-between items-center relative z-20 container mx-auto max-w-4xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-widest text-rose-200/70 font-light">Anı Albümü</span>
        </div>
        <div>
          <Link 
            href="/galeri" 
            className="p-2.5 text-rose-200/80 hover:text-white transition rounded-full hover:bg-white/10 flex items-center gap-1.5 text-xs bg-white/5 border border-white/10"
          >
            <span>🔒</span>
            <span>Bulut Galeriye Git</span>
          </Link>
        </div>
      </header>

      {/* Ana İçerik - Fotoğraf Yükleme Alanı */}
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
            <button onClick={openUploadWidget} className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white px-8 py-4 rounded-full font-medium shadow-lg transition-all cursor-pointer text-base">
              <span>📷 Fotoğraf Yükle</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-rose-100/70 py-6 font-light">
        Sevgiyle Paylaşın • Sinem & Harun ✨
      </footer>
    </div>
  );
}
