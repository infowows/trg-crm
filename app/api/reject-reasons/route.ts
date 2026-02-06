import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RejectReason from "@/models/RejectReason";
import RejectGroup from "@/models/RejectGroup";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded || null;
}

// Helper function to generate unique result code
async function generateReasonCode(
  name: string,
  groupCode: string,
): Promise<string> {
  // Extract first letters from each word
  const words = name
    .split(/[\s–-]+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase());

  let baseCode = words.join("");

  // If code is too short, use first 3-4 chars
  if (baseCode.length < 2) {
    baseCode = name
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  // Prefix with group code
  const prefix = groupCode.substring(0, 2);
  baseCode = `${prefix}_${baseCode}`;

  // Check if code exists
  let code = baseCode;
  let counter = 1;

  while (await RejectReason.findOne({ code: code })) {
    code = `${baseCode}${counter}`;
    counter++;
  }

  return code;
}

// GET - Lấy danh sách lý do từ chối
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
    const groupId = searchParams.get("groupId");
    const groupName = searchParams.get("groupName");

    const query: any = {};
    if (active === "true") {
      query.active = true;
    }
    if (groupId) {
      query.rejectGroupRef = groupId;
    }
    if (groupName) {
      query.rejectGroupName = groupName;
    }

    const reasons = await RejectReason.find(query)
      .populate("rejectGroupRef", "name code")
      .sort({ order: 1, name: 1 });

    return NextResponse.json({
      success: true,
      data: reasons,
    });
  } catch (error) {
    console.error("GET reject reasons error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}

// POST - Tạo lý do từ chối mới
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
      rejectGroupRef,
      rejectGroupName,
      name,
      code,
      description,
      order,
      active,
    } = body;

    if (!rejectGroupRef || !rejectGroupName || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Nhóm lý do và tên lý do là bắt buộc",
        },
        { status: 400 },
      );
    }

    // Verify group exists
    const group = await RejectGroup.findById(rejectGroupRef);
    if (!group) {
      return NextResponse.json(
        { success: false, message: "Nhóm lý do không tồn tại" },
        { status: 404 },
      );
    }

    // Auto-generate code if not provided
    let finalCode = code;
    if (!finalCode || finalCode.trim() === "") {
      finalCode = await generateReasonCode(name, group.code);
    } else {
      finalCode = finalCode.toUpperCase();
      // Check if code already exists
      const existing = await RejectReason.findOne({ code: finalCode });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "Mã lý do đã tồn tại" },
          { status: 400 },
        );
      }
    }

    const reason = await RejectReason.create({
      rejectGroupRef,
      rejectGroupName,
      name,
      code: finalCode,
      description,
      order: order || 0,
      active: active !== undefined ? active : true,
    });

    return NextResponse.json({
      success: true,
      data: reason,
      message: "Tạo lý do từ chối thành công",
    });
  } catch (error: any) {
    console.error("POST reject reason error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 },
    );
  }
}
