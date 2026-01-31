import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Employee from "../../../models/Employee";
import { verifyToken } from "../../../lib/auth";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded;
}

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
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const active = searchParams.get("active");
    const position = searchParams.get("position");

    if (id) {
      const employee = await Employee.findById(id);
      if (!employee) {
        return NextResponse.json(
          { success: false, message: "Không tìm thấy nhân viên" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        data: employee,
      });
    }

    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (active !== null && active !== undefined) {
      query.isActive = active === "true";
    }
    if (position) {
      query.position = { $regex: position, $options: "i" };
    }

    const departmentId = searchParams.get("departmentId");
    if (departmentId) {
      query.department = { $regex: departmentId, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Employee.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

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

    const employee = new Employee(body);
    await employee.save();

    return NextResponse.json(
      {
        success: true,
        data: employee,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating employee:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Employee ID already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID nhân viên" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const employee = await Employee.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy nhân viên" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
      message: "Cập nhật nhân viên thành công",
    });
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID nhân viên" },
        { status: 400 },
      );
    }

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy nhân viên" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa nhân viên thành công",
    });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
