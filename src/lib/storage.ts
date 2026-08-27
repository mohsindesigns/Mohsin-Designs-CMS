import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Universal upload function that handles both local and Cloudinary storage
 */
export async function uploadFile(file: File, buffer: Buffer): Promise<{ url: string; publicId?: string }> {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  // Parse CLOUDINARY_URL if provided
  if (cloudinaryUrl && !cloudName) {
    try {
      const trimmed = cloudinaryUrl.trim().replace(/^["']|["']$/g, '');
      const match = trimmed.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^\/\s]+)/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      } else {
        const url = new URL(trimmed);
        cloudName = url.hostname;
        apiKey = url.username;
        apiSecret = url.password;
      }
    } catch (err) {
      console.error('Failed to parse CLOUDINARY_URL:', err);
    }
  }

  // Use Cloudinary if configured
  if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([buffer], { type: file.type }));
      
      // Use original filename (without extension) as the public_id in Cloudinary
      const dotIdx = file.name.lastIndexOf('.');
      const baseName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
      const cleanFileName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
      formData.append('public_id', cleanFileName);
      
      let endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      
      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      } else if (apiKey && apiSecret) {
        // Signed upload
        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        
        // Generate signature
        const { createHash } = await import('crypto');
        const signatureStr = `public_id=${cleanFileName}&timestamp=${timestamp}${apiSecret}`;
        const signature = createHash('sha1').update(signatureStr).digest('hex');
        formData.append('signature', signature);
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        const errorMsg = data.error?.message || 'Unknown Cloudinary error';
        console.error('Cloudinary API Error:', data.error);
        throw new Error(`Cloudinary Upload Failed: ${errorMsg}`);
      }

      return {
        url: data.secure_url,
        publicId: data.public_id
      };
    } catch (error: any) {
      console.error('Upload Process Error:', error.message);
      throw error;
    }
  }

  // Fallback to local storage (Supported in local development or VPS with writable disk)
  try {
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      publicId: filename
    };
  } catch (fsError: any) {
    console.error('Local filesystem write failed:', fsError.message);
    throw new Error(
      'Image upload failed: The server filesystem is read-only or inaccessible. In production environments (like Vercel/Netlify/Serverless), you must configure Cloudinary environment variables (CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in your hosting dashboard.'
    );
  }
}
