import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression('folder:SİNEM_HARUN/*')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    return NextResponse.json({ success: true, photos: result.resources });
  } catch (error) {
    console.error("Cloudinary API Hatası:", error);
    return NextResponse.json({ success: false, photos: [] }, { status: 500 });
  }
}
