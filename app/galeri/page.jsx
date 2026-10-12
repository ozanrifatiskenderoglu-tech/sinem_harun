'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GaleriSayfasi() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('is_admin_logged');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadPhotos();
    }
  }, []);

  const loadPhotos = () => {
    try {
      const stored = localStorage.getItem('sinem_harun_wedding_gallery');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPhotos(parsed);
        }
      }
    } catch (e) {
      console.error("Fotoğraflar yüklenemedi:", e);
    }
  };

  const deletePhoto = (indexToRemove) => {
    if (confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) {
      const updated = photos.filter((_, i) => i !== indexToRemove);
      setPhotos(updated);
      localStorage.setItem('sinem_harun_wedding_gallery', JSON.stringify(updated));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-rose-50 flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
        <div className="rounded-2xl p-8 w-full max-w-sm space-y-6 text-center border border-white/20" style={{ background: 'rgba(20, 5, 10, 0.95)', backdropFilter: 'blur(16px)' }}>
          <h1 className="text-xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Yetki Gerekli</h1>
          <p className="text-xs text-rose-200/70">Lütfen ana sayfadaki butondan şifre girerek giriş yapın.</p>
          <Link href="/" className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-rose-50 flex flex-col justify-between p-6 md:p-12" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
      <div className="max-w-6xl mx-auto w-full space-y-8 flex-grow">
        
        <div className="flex justify-between items-center border-b border-rose-900/40 pb-4">
          <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-rose-200">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="text-2xl md:text-3xl text-white text-center font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sinem & Harun Canlı Albüm
          </h1>
          <span className="text-xs text-rose-300/80 font-light">Toplam: {photos.length} Fotoğraf</span>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-rose-200/60 text-sm">Henüz bu cihazda kayıtlı fotoğraf bulunmuyor.</p>
            <Link href="/" className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-medium">Ana Sayfadan Fotoğraf Yükle</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-white/5 border border-white/10 group">
                <img 
                  src={url} 
                  alt="Sinem & Harun Albüm Fotoğrafı" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setLightboxImg(url)}
                />
                <button 
                  onClick={() => deletePhoto(i)}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg cursor-pointer"
                >
                  🗑️ Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-rose-100/50 pt-10 font-light">
        Sinem & Harun • Canlı Fotoğraf Galerisi 🤍
      </footer>

      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 text-xl cursor-pointer">✕</button>
          <img src={lightboxImg} alt="Büyük Boyut" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
