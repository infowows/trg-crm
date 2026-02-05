import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import CustomerCare from "../../../../models/CustomerCare";
import { verifyToken } from "../../../../lib/auth";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

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

    await dbConnect();

    const { id } = await params;

    // Tìm kiếm theo _id hoặc careId
    const customerCare = await CustomerCare.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { careId: id }],
    })
      .populate("opportunityRef")
      .populate("customerRef")
      .populate("surveyRef", "surveyNo")
      .populate("quotationRef", "quotationNo");

    if (!customerCare) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch CSKH" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customerCare,
    });
  } catch (error) {
    console.error("Error fetching customer care detail:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy thông tin kế hoạch CSKH" },
      { status: 500 },
    );
  }
}

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

    // Clean up empty date strings and ObjectIds
    if (body.timeFrom === "") body.timeFrom = null;
    if (body.timeTo === "") body.timeTo = null;
    if (body.actualCareDate === "") body.actualCareDate = null;
    if (body.quotationRef === "") body.quotationRef = null;
    if (body.surveyRef === "") body.surveyRef = null;
    if (body.opportunityRef === "") body.opportunityRef = null;
    if (body.customerRef === "") body.customerRef = null;

    const customerCare = await CustomerCare.findOneAndUpdate(
      {
        $or: [
          { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          { careId: id },
        ],
      },
      body,
      { new: true, runValidators: true },
    );

    if (!customerCare) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch CSKH" },
        { status: 404 },
      );
    }

    // Đồng bộ ngược lại demands cho Opportunity nếu có thay đổi dịch vụ quan tâm
    if (
      customerCare.opportunityRef &&
      body.interestedServices &&
      Array.isArray(body.interestedServices)
    ) {
      const Opportunity = (await import("../../../../models/Opportunity"))
        .default;
      await Opportunity.findByIdAndUpdate(customerCare.opportunityRef, {
        $set: { demands: body.interestedServices },
      });
    }

    // Đồng bộ ngược lại cho Survey và Quotation nếu có thay đổi
    if (body.surveyRef) {
      const ProjectSurvey = (await import("../../../../models/ProjectSurvey"))
        .default;
      await ProjectSurvey.findByIdAndUpdate(body.surveyRef, {
        careRef: customerCare._id,
      });
    }

    if (body.quotationRef) {
      const Quotation = (await import("../../../../models/Quotation")).default;
      await Quotation.findByIdAndUpdate(body.quotationRef, {
        careRef: customerCare._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật kế hoạch CSKH thành công",
      data: customerCare,
    });
  } catch (error: any) {
    console.error("Error updating customer care:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Lỗi khi cập nhật kế hoạch CSKH",
      },
      { status: 500 },
    );
  }
}

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

    const customerCare = await CustomerCare.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { careId: id }],
    });

    if (!customerCare) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy kế hoạch CSKH" },
        { status: 404 },
      );
    }

    // Nếu có liên kết cơ hội, xóa ID chăm sóc này khỏi careHistory của Opportunity
    if (customerCare.opportunityRef) {
      const Opportunity = (await import("../../../../models/Opportunity"))
        .default;
      await Opportunity.findByIdAndUpdate(customerCare.opportunityRef, {
        $pull: { careHistory: customerCare._id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa kế hoạch CSKH thành công",
    });
  } catch (error) {
    console.error("Error deleting customer care:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa kế hoạch CSKH" },
      { status: 500 },
    );
  }
}
