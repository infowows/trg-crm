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

// GET - Lấy danh sách phòng ban
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
        const isActive = searchParams.get("isActive");

        // Build query
        let query = {};
        if (isActive !== null) {
            query = { isActive: isActive === "true" };
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
            isActive: true,
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
