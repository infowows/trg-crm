import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CareResult from "@/models/CareResult";
import CareGroup from "@/models/CareGroup";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// Helper function to generate unique result code
async function generateResultCode(
  resultName: string,
  careGroupCode: string,
): Promise<string> {
  // Extract first letters from each word
  const words = resultName
    .split(/[\s–-]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase());

  let baseCode = words.join("");

  // If code is too short, use first 3-4 chars
  if (baseCode.length < 2) {
    baseCode = resultName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  // Prefix with care group code
  const prefix = careGroupCode.substring(0, 2);
  baseCode = `${prefix}_${baseCode}`;

  // Check if code exists
  let code = baseCode;
  let counter = 1;

  while (await CareResult.findOne({ resultCode: code })) {
    code = `${baseCode}${counter}`;
    counter++;
  }

  return code;
}

// GET - Lấy danh sách kết quả chăm sóc
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
    const careGroupId = searchParams.get("careGroupId");
    const careGroupName = searchParams.get("careGroupName");

    const query: any = {};
    if (active === "true") {
      query.active = true;
    }
    if (careGroupId) {
      query.careGroupRef = careGroupId;
    }
    if (careGroupName) {
      query.careGroupName = careGroupName;
    }

    const careResults = await CareResult.find(query)
      .populate("careGroupRef", "name code")
      .sort({ order: 1, resultName: 1 });

    return NextResponse.json({
      success: true,
      data: careResults,
    });
  } catch (error) {
    console.error("GET care results error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// POST - Tạo kết quả chăm sóc mới
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
    const {
      careGroupRef,
      careGroupName,
      resultName,
      resultCode,
      classification,
      description,
      order,
      active,
    } = body;

    if (!careGroupRef || !careGroupName || !resultName || !classification) {
      return NextResponse.json(
        {
          success: false,
          message: "Nhóm chăm sóc, tên kết quả và xếp loại là bắt buộc",
        },
        { status: 400 },
      );
    }

    // Verify care group exists
    const careGroup = await CareGroup.findById(careGroupRef);
    if (!careGroup) {
      return NextResponse.json(
        { success: false, message: "Nhóm chăm sóc không tồn tại" },
        { status: 404 },
      );
    }

    // Auto-generate code if not provided
    let finalCode = resultCode;
    if (!finalCode || finalCode.trim() === "") {
      finalCode = await generateResultCode(resultName, careGroup.code);
    } else {
      finalCode = finalCode.toUpperCase();
      // Check if code already exists
      const existing = await CareResult.findOne({ resultCode: finalCode });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Mã kết quả đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const careResult = await CareResult.create({
      careGroupRef,
      careGroupName,
      resultName,
      resultCode: finalCode,
      classification,
      description,
      order: order || 0,
      active: active !== undefined ? active : true,
    });

    return NextResponse.json({
      success: true,
      data: careResult,
      message: "Tạo kết quả chăm sóc thành công",
    });
  } catch (error: any) {
    console.error("POST care result error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
