import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadFile(file, buffer);

    return NextResponse.json({ url, publicId });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload file." }, { status: 500 });
  }
}
