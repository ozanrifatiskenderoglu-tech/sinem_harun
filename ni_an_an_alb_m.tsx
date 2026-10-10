import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Heart, Sparkles, Image as ImageIcon, Film, 
  Settings, QrCode, Download, Trash2, CheckCircle2, Lock, Unlock,
  Play, Pause, X, User, ShieldCheck, KeyRound, MonitorPlay, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';

const DB_NAME = 'NisanAlbumuDB';
const STORE_NAME = 'media_store';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveMediaToDB = async (item) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
  } catch (err) {
    console.error('IndexedDB save error:', err);
  }
};

const getAllMediaFromDB = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
};

const deleteMediaFromDB = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.error('IndexedDB delete error:', err);
  }
};

const INITIAL_DEMO_DATA = [
  {
    id: 'demo_1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    type: 'image',
    guestName: 'Ahmet & Selin',
    message: 'Ömür boyu mutluluklar dileriz! Harika bir nişan gecesiydi ❤️',
    tag: 'Gelin & Güvey',
    likes: 12,
    timestamp: new Date().toISOString()
  },
  {
    id: 'demo_2',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
    type: 'image',
    guestName: 'Merve Yılmaz',
    message: 'Dostluğumuz daim olsun, çok güzelsiniz!',
    tag: 'Dans/Eğlence',
    likes: 8,
    timestamp: new Date().toISOString()
  }
];

const TAGS = ['Gelin & Güvey', 'Dans/Eğlence', 'Masa/Detaylar', 'Aile & Arkadaşlar', 'Diğer'];

export default function App() {
  // Navigation & View Mode
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'gallery'
  const [galleryFilter, setGalleryFilter] = useState('Tümü');
  
  // Media items state
  const [mediaList, setMediaList] = useState([]);
  
  // Admin PIN settings
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('nisan_admin_pin') || '1234';
  });
  
  // Cloudinary settings
  const [cloudConfig, setCloudConfig] = useState(() => {
    const saved = localStorage.getItem('nisan_cloud_config');
    return saved ? JSON.parse(saved) : { cloudName: '', uploadPreset: '' };
  });

  // Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('Gelin & Güvey');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Modals & Popups
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Slideshow (Projection) Mode State
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);

  // Likes
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('nisan_liked_items');
    return saved ? JSON.parse(saved) : [];
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadMedia = async () => {
      const items = await getAllMediaFromDB();
      if (items && items.length > 0) {
        setMediaList(items);
      } else {
        setMediaList(INITIAL_DEMO_DATA);
      }
    };
    loadMedia();
  }, []);

  useEffect(() => {
    localStorage.setItem('nisan_cloud_config', JSON.stringify(cloudConfig));
  }, [cloudConfig]);

  useEffect(() => {
    localStorage.setItem('nisan_liked_items', JSON.stringify(likedItems));
  }, [likedItems]);

  useEffect(() => {
    localStorage.setItem('nisan_admin_pin', adminPin);
  }, [adminPin]);

  useEffect(() => {
    let interval;
    if (slideshowActive && isSlideshowPlaying && mediaList.length > 0) {
      interval = setInterval(() => {
        setSlideshowIndex(prev => (prev + 1) % mediaList.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [slideshowActive, isSlideshowPlaying, mediaList.length]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsAdminLoggedIn(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
      setActiveTab('gallery');
    } else {
      setPinError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('upload');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files) => {
    const newFileObjs = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name
    }));
    setSelectedFiles(prev => [...prev, ...newFileObjs]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(20);

    const isCloudinaryActive = cloudConfig.cloudName.trim() && cloudConfig.uploadPreset.trim();

    try {
      const newItems = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        let finalUrl = item.previewUrl;

        if (isCloudinaryActive) {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('upload_preset', cloudConfig.uploadPreset);

          const resourceType = item.type === 'video' ? 'video' : 'image';
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/${resourceType}/upload`,
            { method: 'POST', body: formData }
          );

          if (response.ok) {
            const data = await response.json();
            finalUrl = data.secure_url;
          }
        } else {
          // Convert to Base64 for IndexedDB local storage
          finalUrl = await fileToBase64(item.file);
        }

        setUploadProgress(Math.min(90, Math.round(((i + 1) / selectedFiles.length) * 100)));

        const mediaObj = {
          id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          url: finalUrl,
          type: item.type,
          guestName: guestName.trim() || 'Misafir',
          message: guestMessage.trim() || 'Ömür boyu mutluluklar!',
          tag: selectedTag,
          likes: 0,
          timestamp: new Date().toISOString()
        };

        await saveMediaToDB(mediaObj);
        newItems.push(mediaObj);
      }

      setUploadProgress(100);
      setTimeout(() => {
        setMediaList(prev => [...newItems, ...prev]);
        setUploading(false);
        setUploadSuccess(true);
        setSelectedFiles([]);
        setGuestMessage('');
      }, 400);

    } catch (error) {
      console.error('Yükleme hatası:', error);
      alert('Yükleme sırasında bir aksaklık oluştu.');
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id, e) => {
    e?.stopPropagation();
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      await deleteMediaFromDB(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
      if (lightboxItem?.id === id) setLightboxItem(null);
    }
  };

  const toggleLike = (id, e) => {
    e?.stopPropagation();
    const isLiked = likedItems.includes(id);
    const updatedLiked = isLiked ? likedItems.filter(i => i !== id) : [...likedItems, id];
    
    setLikedItems(updatedLiked);
    setMediaList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, likes: isLiked ? item.likes - 1 : item.likes + 1 };
      }
      return item;
    }));
  };

  const filteredMedia = mediaList.filter(item => {
    if (galleryFilter === 'Tümü') return true;
    if (galleryFilter === 'Favoriler') return likedItems.includes(item.id);
    if (galleryFilter === 'Fotoğraf') return item.type === 'image';
    if (galleryFilter === 'Video') return item.type === 'video';
    return item.tag === galleryFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Background Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-screen">

        {/* Header Bar */}
        <header className="bg-slate-900/80 backdrop-blur-md border border-rose-900/30 rounded-3xl p-4 sm:p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Nişan Hatıra Albümü</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-200 via-amber-100 to-rose-300 bg-clip-text text-transparent">
                Ozan & Begüm
              </h1>
            </div>

            {/* Admin Controls / Navigation */}
            <div className="flex items-center gap-2">
              {isAdminLoggedIn ? (
                /* Admin Logged In State */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'upload' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Yükle
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      activeTab === 'gallery' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Galeri ({mediaList.length})
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    title="Ayarlar"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                    title="Çıkış Yap"
                  >
                    <Unlock className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Guest View - Lock Button */
                <button
                  onClick={() => setShowPinModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-300 text-xs font-medium transition"
                  title="Çift Girişi"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Galeri Kilitli</span>
                </button>
              )}

              {/* QR Button */}
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-amber-400 transition"
                title="Masa QR Kodu"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1">
          {activeTab === 'upload' ? (
            <div className="max-w-xl mx-auto space-y-6">
              
              {uploadSuccess ? (
                /* Success View */
                <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
                  <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
                    <Heart className="w-10 h-10 text-rose-400 fill-current animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Anı Tarafımıza Ulaştı 💖</h2>
                    <p className="text-slate-300 text-sm max-w-md mx-auto">
                      Fotoğraf ve güzel dileğiniz için çok teşekkür ederiz! Nişan albümümüze güvenle kaydedildi.
                    </p>
                  </div>

                  <button
                    onClick={() => setUploadSuccess(false)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-semibold text-sm shadow-lg hover:brightness-110 transition inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Başka Anı Yükle</span>
                  </button>
                </div>
              ) : (
                /* Upload Form */
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  
                  {/* File Selector Dropzone */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
                    <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-rose-400" />
                        <span>Fotoğraf veya Video Gönder</span>
                      </span>
                    </label>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-rose-500/30 hover:border-rose-500/70 bg-slate-800/40 hover:bg-slate-800/70 rounded-2xl p-8 text-center cursor-pointer transition duration-200"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-base font-semibold text-slate-200">
                        Galerinizden veya Kameranızdan Seçin
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Birden fazla fotoğraf/video seçebilirsiniz
                      </p>
                    </div>

                    {/* File Previews */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-3 pt-2">
                        {selectedFiles.map((item, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                            {item.type === 'image' ? (
                              <img src={item.previewUrl} alt="Önizleme" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-amber-400">
                                <Film className="w-8 h-8" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeSelectedFile(idx); }}
                              className="absolute top-1 right-1 p-1 bg-slate-950/80 text-rose-400 rounded-full hover:bg-rose-600 hover:text-white transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Guest Input Details */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Adınız / Aileniz</label>
                        <input
                          type="text"
                          placeholder="Örn: Ayşe & Mehmet"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Kategori</label>
                        <select
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500 text-sm"
                        >
                          {TAGS.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Tebrik Notunuz (İsteğe Bağlı)</label>
                      <textarea
                        rows={2}
                        placeholder="Çiftimize bir mesaj bırakın..."
                        value={guestMessage}
                        onChange={(e) => setGuestMessage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    {uploading && (
                      <div className="mb-3 space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Anılarınız İletiliyor...</span>
                          <span>%{uploadProgress}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={selectedFiles.length === 0 || uploading}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:brightness-110 active:scale-[0.99] text-white font-bold text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      <span>{uploading ? 'Yükleniyor...' : `${selectedFiles.length} Anıyı Gönder`}</span>
                    </button>
                  </div>

                </form>
              )}

              {/* Bottom Admin Link */}
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowPinModal(true)}
                  className="text-xs text-slate-500 hover:text-rose-400 transition inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>Çift Girişi / Galeri Kilitli</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Admin Banner & Actions */}
              <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-rose-300">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">Yönetici Modu Açık</span>
                  <span className="text-slate-500">• {filteredMedia.length} Medya Gösteriliyor</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSlideshowIndex(0); setSlideshowActive(true); }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <MonitorPlay className="w-3.5 h-3.5" />
                    <span>Projeksiyon / Slayt Modu</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['Tümü', 'Favoriler', 'Fotoğraf', 'Video', ...TAGS].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      galleryFilter === cat
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedia.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                      {item.type === 'image' ? (
                        <img src={item.url} alt="Anı" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-400">
                          <Play className="w-10 h-10" />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded-full text-[10px] text-rose-300 border border-rose-500/30">
                        {item.tag}
                      </div>

                      {/* Admin Delete Button */}
                      <button
                        onClick={(e) => handleDeleteMedia(item.id, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                        title="Fotoğrafı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900 flex flex-col justify-between flex-1 space-y-2">
                      {item.message && (
                        <p className="text-xs text-slate-300 italic line-clamp-2">"{item.message}"</p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span className="font-semibold text-slate-200">{item.guestName}</span>
                        <div className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3 h-3 fill-rose-500/20" />
                          <span>{item.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </main>

        <footer className="mt-12 py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>Ozan & Begüm Nişan Anı Albümü Platformu</p>
        </footer>

      </div>

      {}
      {showPinModal && (
        <div
          onClick={() => setShowPinModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-xs w-full text-center space-y-5 shadow-2xl relative"
          >
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400 border border-rose-500/20">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Çift / Yönetici Girişi</h3>
              <p className="text-xs text-slate-400 mt-1">Canlı galeriyi görmek için PIN şifrenizi girin</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                placeholder="PIN Şifresi (Varsayılan: 1234)"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                className={`w-full text-center px-4 py-2.5 rounded-xl bg-slate-800 border text-slate-100 text-base tracking-widest focus:outline-none ${
                  pinError ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 focus:border-rose-500'
                }`}
              />

              {pinError && (
                <p className="text-xs text-rose-400">Hatalı PIN! Tekrar deneyin.</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-semibold text-xs shadow-lg hover:brightness-110 transition"
              >
                Galeriyi Aç
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-black flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              {lightboxItem.type === 'image' ? (
                <img src={lightboxItem.url} alt="Büyük Boyut" className="max-h-[70vh] w-auto object-contain" />
              ) : (
                <video src={lightboxItem.url} controls autoPlay className="max-h-[70vh] w-full" />
              )}
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between border-t border-slate-800">
              <div>
                <p className="text-sm font-bold text-slate-100">{lightboxItem.guestName}</p>
                <p className="text-xs text-slate-400 italic">"{lightboxItem.message}"</p>
              </div>

              <a
                href={lightboxItem.url}
                download="nisan-ani.jpg"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="İndir"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {}
      {slideshowActive && mediaList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6">
          {/* Top Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="text-white">
              <h3 className="text-xl font-bold bg-gradient-to-r from-rose-300 to-amber-200 bg-clip-text text-transparent">
                Ozan & Begüm Nişan Canlı Yayın
              </h3>
              <p className="text-xs text-slate-400">Masa QR Kodu ile Siz de Fotoğraf Gönderin!</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className="p-3 rounded-full bg-slate-900/80 text-white border border-slate-800"
              >
                {isSlideshowPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setSlideshowActive(false)}
                className="p-3 rounded-full bg-rose-600 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slideshow Display */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            {mediaList[slideshowIndex].type === 'image' ? (
              <img
                src={mediaList[slideshowIndex].url}
                alt="Slayt"
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl animate-fade-in"
              />
            ) : (
              <video
                src={mediaList[slideshowIndex].url}
                autoPlay
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl"
              />
            )}

            {/* Guest Caption Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-rose-500/30 text-center max-w-md">
              <p className="text-sm font-semibold text-rose-300">
                {mediaList[slideshowIndex].guestName}
              </p>
              <p className="text-xs text-slate-200 italic mt-0.5">
                "{mediaList[slideshowIndex].message}"
              </p>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="flex justify-between items-center z-10">
            <button
              onClick={() => setSlideshowIndex((slideshowIndex - 1 + mediaList.length) % mediaList.length)}
              className="p-3 rounded-full bg-slate-900/80 text-white border border-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-500">{slideshowIndex + 1} / {mediaList.length}</span>
            <button
              onClick={() => setSlideshowIndex((slideshowIndex + 1) % mediaList.length)}
              className="p-3 rounded-full bg-slate-900/80 text-white border border-slate-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {}
      {showQRModal && (
        <div
          onClick={() => setShowQRModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative"
          >
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Masa QR Kodu</h3>
              <p className="text-xs text-slate-400">Masalarınıza yerleştirebilirsiniz</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-4 border-rose-100 inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                alt="QR Kod"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-300">
              "Kameranızı açın ve QR kodu okutarak fotoğraf gönderin!"
            </p>
          </div>
        </div>
      )}

      {}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
          >
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-100">Yönetici Ayarları</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Giriş PIN Şifreniz</label>
                <input
                  type="text"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cloudinary Cloud Name</label>
                <input
                  type="text"
                  placeholder="Örn: dxyz1234"
                  value={cloudConfig.cloudName}
                  onChange={(e) => setCloudConfig(prev => ({ ...prev, cloudName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Upload Preset (Unsigned)</label>
                <input
                  type="text"
                  placeholder="Örn: nisan_albumu"
                  value={cloudConfig.uploadPreset}
                  onChange={(e) => setCloudConfig(prev => ({ ...prev, uploadPreset: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

    </div>
  );
}