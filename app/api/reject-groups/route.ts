import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RejectGroup from "@/models/RejectGroup";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// Helper function to generate unique code
async function generateRejectGroupCode(name: string): Promise<string> {
  // Extract first letters from each word
  const words = name
    .split(/[\s–-]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase());

  let baseCode = words.join("");

  // If code is too short, use first 4 chars of name
  if (baseCode.length < 2) {
    baseCode = name
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  // Check if code exists
  let code = baseCode;
  let counter = 1;

  while (await RejectGroup.findOne({ code })) {
    code = `${baseCode}${counter}`;
    counter++;
  }

  return code;
}

// GET - Lấy danh sách nhóm lý do từ chối
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const query: any = {};
    if (active === "true") {
      query.active = true;
    }

    const rejectGroups = await RejectGroup.find(query).sort({
      order: 1,
      name: 1,
    });

    return NextResponse.json({
      success: true,
      data: rejectGroups,
    });
  } catch (error) {
    console.error("GET reject groups error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// POST - Tạo nhóm lý do từ chối mới
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    const { name, code, description, order, active } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Tên nhóm là bắt buộc" },
        { status: 400 },
      );
    }

    // Auto-generate code if not provided
    let finalCode = code;
    if (!finalCode || finalCode.trim() === "") {
      finalCode = await generateRejectGroupCode(name);
    } else {
      finalCode = finalCode.toUpperCase();
      // Check if code already exists
      const existing = await RejectGroup.findOne({ code: finalCode });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Mã nhóm đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const rejectGroup = await RejectGroup.create({
      name,
      code: finalCode,
      description,
      order: order || 0,
      active: active !== undefined ? active : true,
    });

    return NextResponse.json({
      success: true,
      data: rejectGroup,
      message: "Tạo nhóm lý do từ chối thành công",
    });
  } catch (error: any) {
    console.error("POST reject group error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Mã nhóm đã tồn tại" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
