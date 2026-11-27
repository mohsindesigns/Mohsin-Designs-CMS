import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const LOCAL_EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'application/pdf': '.pdf',
};

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
      // Signed uploads overwrite an existing public_id, so a same-named file would replace an asset already in use.
      const cleanFileName = `${baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'file'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      formData.append('public_id', cleanFileName);

      // The `/auto/upload` endpoint content-sniffs the file to pick a resource type, and Cloudinary
      // classifies SVGs (and anything it doesn't recognize as a raster image, e.g. a mislabeled or
      // corrupted file) as `raw`. Unlike `image`/`video`, a `raw` upload's secure_url does NOT get
      // the original extension appended, so the returned URL came back with no extension at all and
      // was served as `application/octet-stream` - a browser <img> tag can't render that, so the
      // upload "succeeded" but the picture never actually appeared anywhere on the site. Telling
      // Cloudinary the resource type ourselves, from the browser-reported MIME type (which is what
      // the file picker's `accept="image/*"` already restricted uploads to), avoids the
      // mis-detection: `image`/`video` still auto-append the correct extension on their own.
      const resourceType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'auto';
      let endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

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
  // Extension comes from the (allowlisted) MIME type, never the client filename: a file named
  // 'x.html' or 'x.svg' would otherwise be served as active content from our origin.
  const ext = LOCAL_EXT_BY_MIME[(file.type || '').toLowerCase()];
  if (!ext) throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
  try {
    // basename + safe charset: a crafted name like '../../x.js' must not escape public/uploads.
    const base = path.basename(file.name);
    const dot = base.lastIndexOf('.');
    const safeBase = (dot > 0 ? base.slice(0, dot) : base).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80) || 'file';
    const filename = `${Date.now()}-${safeBase}${ext}`;
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
