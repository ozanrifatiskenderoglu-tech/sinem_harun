'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GaleriSayfasi() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [lightboxImg, setLightboxImg] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [directPassword, setDirectPassword] = useState('');

  const ADMIN_PASS = "171026";

  useEffect(() => {
    // Oturum izni kontrolü
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
        setPhotos(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Fotoğraflar yüklenemedi:", e);
    }
  };

  const handleDirectLogin = (e) => {
    e.preventDefault();
    if (directPassword === ADMIN_PASS) {
      sessionStorage.setItem('is_admin_logged', 'true');
      setIsAuthenticated(true);
      loadPhotos();
    } else {
      alert("Hatalı şifre!");
      setDirectPassword('');
    }
  };

  const saveStoredPhotos = (p) => {
    setPhotos(p);
    localStorage.setItem('sinem_harun_wedding_gallery', JSON.stringify(p));
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
    if (confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) {
      const updated = photos.filter((_, index) => index !== i);
      saveStoredPhotos(updated);
      const newSelected = new Set(selectedIndices);
      newSelected.delete(i);
      setSelectedIndices(newSelected);
    }
  };

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

  // Eğer şifre girilmediyse doğrudan linkle gelenlere şifre ekranı göster
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-rose-50 flex flex-col items-center justify-center relative overflow-x-hidden p-4" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
        <div className="rounded-2xl p-8 w-full max-w-sm space-y-6 shadow-2xl relative border border-white/20 text-center" style={{ background: 'rgba(20, 5, 10, 0.95)', backdropFilter: 'blur(16px)' }}>
          <div className="space-y-2">
            <span className="text-2xl">🔒</span>
            <h1 className="text-xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Yetkili Girişi Gerekli</h1>
            <p className="text-xs text-rose-200/70">Bu sayfayı görüntülemek için yönetici şifresini girmeniz gerekmektedir.</p>
          </div>
          <form onSubmit={handleDirectLogin} className="space-y-4">
            <input 
              type="password" 
              value={directPassword} 
              onChange={(e) => setDirectPassword(e.target.value)} 
              placeholder="Yönetici Şifresi" 
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 text-center text-sm" 
              autoFocus
            />
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 rounded-xl transition text-sm cursor-pointer shadow-lg">
              Giriş Yap
            </button>
          </form>
          <div>
            <Link href="/" className="text-xs text-rose-300/70 hover:text-white underline transition">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-rose-50 flex flex-col justify-between relative overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-rose-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <header className="p-4 flex justify-between items-center relative z-20 container mx-auto max-w-4xl border-b border-rose-900/30">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-widest text-rose-200/70 font-light">Bulut Galeri & Yönetim</span>
        </div>
        <div>
          <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition text-rose-200 shadow-sm">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 relative z-10 space-y-6 flex-grow">
        <div className="flex flex-wrap items-center justify-between border-b border-rose-900/40 pb-4 gap-2">
          <div>
            <h1 className="text-2xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
              Yönetici Paneli & Fotoğraflar
            </h1>
            <p className="text-xs text-rose-200/70 mt-1">Toplam {photos.length} fotoğraf yüklendi.</p>
          </div>
          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <>
                <button onClick={toggleSelectAll} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition text-rose-200 cursor-pointer">
                  {selectedIndices.size === photos.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                </button>
                {selectedIndices.size > 0 && (
                  <button onClick={downloadSelected} disabled={isDownloading} className="text-xs bg-rose-600 hover:bg-rose-500 px-3 py-2 rounded-lg transition text-white shadow-md disabled:opacity-50 cursor-pointer">
                    {isDownloading ? 'İndiriliyor...' : `Seçilenleri İndir (${selectedIndices.size})`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-rose-200/60 text-sm">Henüz hiç fotoğraf yüklenmemiş.</p>
            <Link href="/" className="inline-block text-xs bg-rose-600 text-white px-4 py-2 rounded-lg">Ana Sayfadan Fotoğraf Yükle</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((url, i) => {
              const isChecked = selectedIndices.has(i);
              return (
                <div key={i} className={`group relative aspect-square rounded-2xl overflow-hidden shadow-md border ${isChecked ? 'border-rose-500 ring-2 ring-rose-500' : 'border-transparent'}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleSelectPhoto(i)} className="absolute top-2 left-2 z-20 w-5 h-5 accent-rose-600 cursor-pointer" />
                  <img src={url} alt="Albüm Fotoğrafı" className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer" onClick={() => setLightboxImg(url)} />
                  <button onClick={() => deletePhoto(i)} className="absolute top-2 right-2 z-25 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition cursor-pointer" title="Sil">🗑️</button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center text-xs text-rose-100/70 py-6 font-light space-y-1">
        <div>Sevgiyle Paylaşın • Sinem & Harun ✨</div>
        <div className="text-[11px] opacity-80">Created by <a href="https://instagram.com/ori.bilisim" target="_blank" className="font-semibold underline hover:text-white transition">ori.bilisim 🤍</a></div>
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
