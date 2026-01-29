import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/dbConnect";
import Department from "@/models/Department";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy danh sách phòng ban hoặc chi tiết một phòng ban
export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await clientPromise;
        await mongoose.connection.db;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const isActive = searchParams.get("isActive");
        const search = searchParams.get("search") || "";

        // Nếu có id, trả về chi tiết một phòng ban
        if (id) {
            const department = await Department.findById(id);
            if (!department) {
                return NextResponse.json(
                    { success: false, message: "Không tìm thấy phòng ban" },
                    { status: 404 },
                );
            }
            return NextResponse.json({
                success: true,
                data: department,
            });
        }

        // Ngược lại, trả về danh sách
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { manager: { $regex: search, $options: "i" } },
                ],
            };
        }

        if (isActive !== null) {
            query = { ...query, isActive: isActive === "true" };
        }

        const departments = await Department.find(query)
            .select(
                "_id name description isActive manager employeeCount createdAt updatedAt",
            )
            .sort({ name: 1 });

        return NextResponse.json({
            success: true,
            data: departments,
        });
    } catch (error) {
        console.error("GET departments error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// POST - Tạo phòng ban mới
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await clientPromise;
        await mongoose.connection.db;

        const body = await request.json();
        const { name, description, manager } = body;

        console.log("POST department data:", { name, description, manager });

        // Validation
        if (!name || name.trim() === "") {
            return NextResponse.json(
                { success: false, message: "Tên phòng ban là bắt buộc" },
                { status: 400 },
            );
        }

        // Check duplicate name
        const existingDepartment = await Department.findOne({
            name: name.trim(),
        });

        if (existingDepartment) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tên phòng ban đã tồn tại",
                    existingData: {
                        _id: existingDepartment._id,
                        name: existingDepartment.name,
                        description: existingDepartment.description,
                        manager: existingDepartment.manager,
                        employeeCount: existingDepartment.employeeCount,
                        isActive: existingDepartment.isActive,
                        createdAt: existingDepartment.createdAt,
                    },
                },
                { status: 400 },
            );
        }

        // Create department
        const department = new Department({
            name: name.trim(),
            description: description?.trim() || "",
            manager: manager || null,
        });

        console.log("Department object to save:", department);

        await department.save();

        return NextResponse.json({
            success: true,
            message: "Tạo phòng ban thành công",
            data: department,
        });
    } catch (error) {
        console.error("POST department error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Error details:", errorMessage);
        console.error(
            "Error stack:",
            error instanceof Error ? error.stack : "No stack trace",
        );
        return NextResponse.json(
            {
                success: false,
                message: "Có lỗi xảy ra. Vui lòng thử lại.",
                error: errorMessage,
            },
            { status: 500 },
        );
    }
}

// PUT - Cập nhật phòng ban
export async function PUT(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await clientPromise;
        await mongoose.connection.db;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Thiếu ID phòng ban" },
                { status: 400 },
            );
        }

        const body = await request.json();
        const { name, description, manager, isActive } = body;

        // Validation
        if (!name || name.trim() === "") {
            return NextResponse.json(
                { success: false, message: "Tên phòng ban là bắt buộc" },
                { status: 400 },
            );
        }

        // Check duplicate name (excluding current department)
        const existingDepartment = await Department.findOne({
            _id: { $ne: id },
            name: name.trim(),
        });

        if (existingDepartment) {
            return NextResponse.json(
                { success: false, message: "Tên phòng ban đã tồn tại" },
                { status: 400 },
            );
        }

        const department = await Department.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description?.trim() || "",
                manager: manager || null,
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true },
        );

        if (!department) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy phòng ban" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: department,
            message: "Cập nhật phòng ban thành công",
        });
    } catch (error) {
        console.error("PUT department error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// DELETE - Xóa phòng ban
export async function DELETE(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json(
                { success: false, message: "Không được phép truy cập" },
                { status: 401 },
            );
        }

        await clientPromise;
        await mongoose.connection.db;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Thiếu ID phòng ban" },
                { status: 400 },
            );
        }

        const department = await Department.findByIdAndDelete(id);

        if (!department) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy phòng ban" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Xóa phòng ban thành công",
        });
    } catch (error) {
        console.error("DELETE department error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
