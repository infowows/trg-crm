import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import SourceSetting from "../../../../models/SourceSetting";
import { verifyToken } from "../../../../lib/auth";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy một source setting theo ID
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

        const sourceSetting = await SourceSetting.findById(id);

        if (!sourceSetting) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy nguồn khách hàng" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: sourceSetting,
        });
    } catch (error) {
        console.error("Error fetching source setting:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// PUT - Cập nhật source setting
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

        const sourceSetting = await SourceSetting.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
            { new: true, runValidators: true },
        );

        if (!sourceSetting) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy nguồn khách hàng" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Cập nhật thành công",
            data: sourceSetting,
        });
    } catch (error) {
        console.error("Error updating source setting:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// DELETE - Xóa source setting
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

        const sourceSetting = await SourceSetting.findByIdAndDelete(id);

        if (!sourceSetting) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy nguồn khách hàng" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            message: "Xóa thành công",
        });
    } catch (error) {
        console.error("Error deleting source setting:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
