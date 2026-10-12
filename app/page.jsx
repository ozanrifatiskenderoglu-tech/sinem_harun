// TEST
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnaSayfa() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const CLOUD_NAME = "qlxdd0ki";
  const UPLOAD_PRESET = "SINEM_HARUN";
  const ADMIN_PASS = "171026";

  useEffect(() => {
    // Cloudinary Upload Widget script yüklemesi
    if (!document.getElementById('cloudinary-widget-script')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-widget-script';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }

    try {
      const stored = localStorage.getItem('sinem_harun_wedding_gallery');
      if (stored) setPhotos(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const saveStoredPhotos = (p) => {
    setPhotos(p);
    localStorage.setItem('sinem_harun_wedding_gallery', JSON.stringify(p));
  };

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
          setPhotos((prevPhotos) => {
            if (!prevPhotos.includes(newUrl)) {
              const updated = [newUrl, ...prevPhotos];
              localStorage.setItem('sinem_harun_wedding_gallery', JSON.stringify(updated));
              return updated;
            }
            return prevPhotos;
          });
          alert("Fotoğrafınız başarıyla gönderildi! Teşekkür ederiz. ✨");
        }
      }).open();
    }
  };

  const verifyAdmin = () => {
    if (adminPassword === ADMIN_PASS) {
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminPassword('');
    } else {
      alert("Hatalı şifre!");
    }
  };

  const toggleSelectPhoto = (i) => {
    const newSelected = new Set(selectedIndices);
    newSelected.has(i) ? newSelected.delete(i) : newSelected.add(i);
    setSelectedIndices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === photos.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(photos.map((_, i) => i)));
    }
  };

  const deletePhoto = (i) => {
    if (confirm("Silmek istediğinize emin misiniz?")) {
      const updated = photos.filter((_, index) => index !== i);
      saveStoredPhotos(updated);
      const newSelected = new Set(selectedIndices);
      newSelected.delete(i);
      setSelectedIndices(newSelected);
    }
  };

  // Toplu İndirme Fonksiyonu
  const downloadSelected = async () => {
    if (selectedIndices.size === 0) return;
    setIsDownloading(true);
    let count = 0;
    for (const i of selectedIndices) {
      const url = photos[i];
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `sinem-harun-${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        count++;
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error("İndirme hatası:", err);
      }
    }
    setIsDownloading(false);
    alert(`${count} fotoğraf başarıyla indirildi!`);
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
          <Link href="/galeri" className="text-xs bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition text-rose-200 shadow-sm">
             🔒
          </Link>
          <button onClick={() => setIsAdminModalOpen(true)} className="p-2 text-rose-200/60 hover:text-rose-100 transition rounded-full hover:bg-white/5" title="Yönetici Girişi">
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
            <button onClick={openUploadWidget} className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white px-8 py-3.5 rounded-full font-medium shadow-lg hover:shadow-rose-900/40 transition-all cursor-pointer">
              <span>📷 Fotoğraf Yükle</span>
            </button>
          </div>
        </div>

        {/* Yönetici Paneli (Şifre Girilince Görünür) */}
        {isAdmin && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-rose-900/40 pb-3 gap-2">
              <h2 className="text-lg text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Yönetici Albümü ({photos.length})
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={toggleSelectAll} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition text-rose-200">
                  {selectedIndices.size === photos.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                </button>
                {selectedIndices.size > 0 && (
                  <button onClick={downloadSelected} disabled={isDownloading} className="text-xs bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition text-white shadow-md disabled:opacity-50">
                    {isDownloading ? 'İndiriliyor...' : `Seçilenleri İndir (${selectedIndices.size})`}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {photos.map((url, i) => {
                const isChecked = selectedIndices.has(i);
                return (
                  <div key={i} className={`group relative aspect-square rounded-2xl overflow-hidden shadow-md border ${isChecked ? 'border-rose-500 ring-2 ring-rose-500' : 'border-transparent'}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleSelectPhoto(i)} className="absolute top-2 left-2 z-20 w-5 h-5 accent-rose-600 cursor-pointer" />
                    <img src={url} alt="Yüklenen fotoğraf" className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer" onClick={() => setLightboxImg(url)} />
                    <button onClick={() => deletePhoto(i)} className="absolute top-2 right-2 z-25 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition" title="Sil">🗑️</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="relative z-10 text-center text-xs text-rose-100/70 py-6 font-light space-y-1">
        <div>Sevgiyle Paylaşın • Sinem & Harun ✨</div>
        <div className="text-[11px] opacity-80">Created by <a href="https://instagram.com/ori.bilisim" target="_blank" className="font-semibold underline hover:text-white transition">ori.bilisim 🤍</a></div>
      </footer>

      {/* Yönetici Giriş Modalı */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl relative border border-white/20" style={{ background: 'rgba(20, 5, 10, 0.95)', backdropFilter: 'blur(16px)' }}>
            <button onClick={() => setIsAdminModalOpen(false)} className="absolute top-4 right-4 text-rose-200/60 hover:text-white">✕</button>
            <h3 className="text-lg text-center text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Yönetici Girişi</h3>
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Şifre" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 text-center text-sm" />
            <button onClick={verifyAdmin} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2.5 rounded-xl transition text-sm">Giriş Yap</button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 text-xl">✕</button>
          <img src={lightboxImg} alt="Büyük Boyut" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
