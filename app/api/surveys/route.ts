import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProjectSurvey from "@/models/ProjectSurvey";
import { verifyToken } from "@/lib/auth";

// Helper function to verify authentication
async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
}

// GET - Lấy danh sách khảo sát
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
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const hasQuotation = searchParams.get("hasQuotation");

        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { surveyNo: { $regex: search, $options: "i" } },
                { surveyAddress: { $regex: search, $options: "i" } },
                { "surveys.name": { $regex: search, $options: "i" } },
                { createdBy: { $regex: search, $options: "i" } },
            ];
        }

        if (hasQuotation !== null) {
            if (hasQuotation === "true") {
                query.quotationNo = { $ne: null };
            } else {
                query.quotationNo = null;
            }
        }

        const skip = (page - 1) * limit;

        const [surveys, total] = await Promise.all([
            ProjectSurvey.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ProjectSurvey.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: surveys,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET surveys error:", error);
        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}

// POST - Thêm khảo sát mới
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
        const { surveys, surveyDate, surveyAddress, surveyNotes } = body;

        if (!surveyDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vui lòng nhập ngày khảo sát",
                },
                { status: 400 },
            );
        }

        if (!surveys || !Array.isArray(surveys) || surveys.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vui lòng nhập ít nhất một hạng mục khảo sát",
                },
                { status: 400 },
            );
        }

        // Validate surveys data
        for (const survey of surveys) {
            if (
                !survey.name ||
                !survey.unit ||
                survey.length === undefined ||
                survey.width === undefined
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Dữ liệu hạng mục không hợp lệ",
                    },
                    { status: 400 },
                );
            }
        }

        // Tạo số khảo sát tự động
        const lastSurvey = await ProjectSurvey.findOne().sort({
            createdAt: -1,
        });
        let surveyNo = "KS001";

        if (lastSurvey && lastSurvey.surveyNo) {
            const lastNumber = parseInt(lastSurvey.surveyNo.replace("KS", ""));
            surveyNo = `KS${String(lastNumber + 1).padStart(3, "0")}`;
        }

        const survey = new ProjectSurvey({
            surveyNo,
            surveys,
            quotationNo: null,
            status: "draft",
            surveyDate: new Date(surveyDate),
            surveyAddress,
            surveyNotes,
            createdBy: auth.username,
        });

        await survey.save();

        return NextResponse.json({
            success: true,
            message: "Thêm khảo sát thành công",
            data: survey,
        });
    } catch (error: any) {
        console.error("POST survey error:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Số khảo sát đã tồn tại" },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { success: false, message: "Có lỗi xảy ra. Vui lòng thử lại." },
            { status: 500 },
        );
    }
}
