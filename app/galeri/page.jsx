import { v2 as cloudinary } from 'cloudinary';
import Image from 'next/image';
import Link from 'next/link';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function GaleriSayfasi() {
  let fotograflar = [];
  
  try {
    const result = await cloudinary.search
      .expression('folder:SİNEM_HARUN/*')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    fotograflar = result.resources;
  } catch (error) {
    console.error("Cloudinary fotoğraf çekme hatası:", error);
  }

  return (
    <div className="min-h-screen text-rose-50 flex flex-col justify-between p-6 md:p-12" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
      <div className="max-w-6xl mx-auto w-full space-y-8 flex-grow">
        
        {/* Üst Menü */}
        <div className="flex justify-between items-center border-b border-rose-900/40 pb-4">
          <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-rose-200">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="text-2xl md:text-3xl text-white text-center font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sinem & Harun Canlı Albüm
          </h1>
          <span className="text-xs text-rose-300/80 font-light">Toplam: {fotograflar.length} Fotoğraf</span>
        </div>

        {/* Fotoğraf Grid Alanı */}
        {fotograflar.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-rose-200/60 text-sm">Henüz bu klasörde fotoğraf bulunmuyor veya Cloudinary bağlantısı kontrol edilmeyi bekliyor.</p>
            <Link href="/" className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-medium">İlk Fotoğrafı Sen Yükle</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotograflar.map((foto) => (
              <div key={foto.public_id} className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-white/5 border border-white/10 group">
                <Image 
                  src={foto.secure_url} 
                  alt="Sinem & Harun Nişan Fotoğrafı" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-rose-100/50 pt-10 font-light">
        Sinem & Harun • Canlı Fotoğraf Galerisi 🤍
      </footer>
    </div>
  );
}
