import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { getSessionUser, hasPermission } from "@/lib/rbac";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf"
];
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasPermission(req, "media", "create"))) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: "Invalid file type. Only standard images and PDFs are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadFile(file, buffer);

    return NextResponse.json({ url, publicId });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload file." }, { status: 500 });
  }
}
