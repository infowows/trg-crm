import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import ProjectSurvey from "../../../../models/ProjectSurvey";
import { verifyToken } from "../../../../lib/auth";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

// GET - Lấy chi tiết khảo sát
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully");

    const { id } = await params;

    console.log("GET survey by ID:", id);
    console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(id));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID khảo sát không hợp lệ", id },
        { status: 400 },
      );
    }

    console.log("Finding survey in database...");
    const survey = await ProjectSurvey.findById(id).populate("careRef");

    console.log("Found survey:", survey);

    if (!survey) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khảo sát", id },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: survey,
    });
  } catch (error: any) {
    console.error("GET survey detail error:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra khi lấy thông tin khảo sát",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Cập nhật khảo sát
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const {
      surveys,
      status,
      surveyDate,
      surveyAddress,
      surveyNotes,
      quotationNo,
      careRef,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID khảo sát không hợp lệ" },
        { status: 400 },
      );
    }

    const survey = await ProjectSurvey.findById(id);
    if (!survey) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khảo sát" },
        { status: 404 },
      );
    }

    // Cập nhật các trường
    if (surveys !== undefined) survey.surveys = surveys;
    if (status !== undefined) survey.status = status;
    if (surveyDate !== undefined) survey.surveyDate = new Date(surveyDate);
    if (surveyAddress !== undefined) survey.surveyAddress = surveyAddress;
    if (surveyNotes !== undefined) survey.surveyNotes = surveyNotes;
    if (quotationNo !== undefined) survey.quotationNo = quotationNo;
    if (careRef !== undefined) survey.careRef = careRef;

    survey.updatedAt = new Date();
    await survey.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật khảo sát thành công",
      data: survey,
    });
  } catch (error) {
    console.error("PUT survey error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

// DELETE - Xóa khảo sát
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Không được phép truy cập" },
        { status: 401 },
      );
    }

    await dbConnect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "ID khảo sát không hợp lệ" },
        { status: 400 },
      );
    }

    const survey = await ProjectSurvey.findById(id);
    if (!survey) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khảo sát" },
        { status: 404 },
      );
    }

    // Kiểm tra trạng thái trước khi xóa
    if (survey.quotationNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa khảo sát đã tạo báo giá",
        },
        { status: 400 },
      );
    }

    await ProjectSurvey.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa khảo sát thành công",
    });
  } catch (error) {
    console.error("DELETE survey error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
