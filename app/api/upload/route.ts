import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_APIKEY,
  api_secret: process.env.VITE_CLOUDINARY_APISECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "trg-crm";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Lấy tên file gốc (ví dụ: hop-dong.docx)
    const originalFileName = file.name;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto", // Tự động nhận diện (image, video, raw)
          
          // --- CẤU HÌNH QUAN TRỌNG ĐỂ GIỮ ĐUÔI FILE ---
          use_filename: true,      // Sử dụng tên file gốc làm public_id
          unique_filename: true,   // Thêm chuỗi ngẫu nhiên để tránh trùng tên nhưng VẪN GIỮ đuôi file
          filename_override: originalFileName, // Gửi tên file gốc vào để Cloudinary biết
          // --------------------------------------------
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        // secure_url lúc này sẽ có dạng: .../baocao_xyz123.docx
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        resource_type: result.resource_type,
        original_filename: result.original_filename, // Trả về thêm tên gốc nếu cần
      },
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}