import { v2 as cloudinary } from 'cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ADMIN_PASS = "171026";

export default async function GaleriSayfasi({ searchParams }) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('admin_auth');

  const params = await searchParams;
  const password = params?.password;

  if (password) {
    if (password === ADMIN_PASS) {
      cookieStore.set('admin_auth', 'true', { httpOnly: true, path: '/' });
      redirect('/galeri');
    }
  }

  if (authCookie?.value !== 'true') {
    return (
      <div className="min-h-screen text-rose-50 flex flex-col items-center justify-center relative overflow-x-hidden p-4" style={{ background: 'linear-gradient(135deg, #1a050b 0%, #2b0914 50%, #150308 100%)' }}>
        <div className="rounded-2xl p-8 w-full max-w-sm space-y-6 shadow-2xl relative border border-white/20 text-center" style={{ background: 'rgba(20, 5, 10, 0.95)', backdropFilter: 'blur(16px)' }}>
          <div className="space-y-2">
            <span className="text-2xl">🔒</span>
            <h1 className="text-xl text-white font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Yetkili Girişi Gerekli</h1>
            <p className="text-xs text-rose-200/70">Bulut galeriyi görüntülemek için yönetici şifresini girmeniz gerekmektedir.</p>
          </div>
          
          <form method="GET" action="/galeri" className="space-y-4">
            <input 
              type="password" 
              name="password"
              placeholder="Yönetici Şifresi" 
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-rose-200/40 focus:outline-none focus:border-rose-400 text-center text-sm" 
              autoFocus
              required
            />
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 rounded-xl transition text-sm cursor-pointer shadow-lg">
              Giriş Yap
            </button>
          </form>

          {password && password !== ADMIN_PASS && (
            <p className="text-xs text-red-400">Hatalı şifre!</p>
          )}

          <div>
            <Link href="/" className="text-xs text-rose-300/70 hover:text-white underline transition">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cloudinary'den klasördeki fotoğrafları çek
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
        
        <div className="flex justify-between items-center border-b border-rose-900/40 pb-4">
          <Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-rose-200">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="text-2xl md:text-3xl text-white text-center font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sinem & Harun Canlı Albüm
          </h1>
          <span className="text-xs text-rose-300/80 font-light">Toplam: {fotograflar.length} Fotoğraf</span>
        </div>

        {fotograflar.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-rose-200/60 text-sm">Henüz Cloudinary klasöründe fotoğraf bulunmuyor.</p>
            <Link href="/" className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-full text-sm font-medium">Ana Sayfaya Dön</Link>
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
