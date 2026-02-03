import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.VITE_CLOUDINARY_APIKEY;
    const apiSecret = process.env.VITE_CLOUDINARY_APISECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing" },
        { status: 500 },
      );
    }

    // Đảm bảo cấu hình Cloudinary được nạp
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "trg-crm";

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Empty file provided" },
        { status: 400 },
      );
    }

    const mimeType = file.type;
    const originalFileName = (file as any).name || "unnamed_file";

    // Logic xác định resource_type chuẩn:
    // PDF/Office/Dữ liệu khác nên dùng 'raw' để giữ nguyên vẹn file (tránh lỗi 0kb do Cloudinary image processing)
    let resourceType: "auto" | "image" | "video" | "raw" = "raw";

    if (mimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (mimeType.startsWith("video/")) {
      resourceType = "video";
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    const result: any = await new Promise((resolve, reject) => {
      console.log(
        `[Upload API] Starting upload: ${originalFileName} (${mimeType}) -> ${resourceType}`,
      );

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error("[Upload API] Cloudinary error:", error);
            reject(error);
          } else {
            console.log(`[Upload API] Success: ${result?.secure_url}`);
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format || originalFileName.split(".").pop(),
        resource_type: result.resource_type,
        type: result.resource_type,
        original_filename: originalFileName,
      },
    });
  } catch (error: any) {
    console.error("[Upload API] Critical error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
